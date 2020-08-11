import torch
import torch.nn as nn
from typing import List,Any
from transformers.modeling_roberta import ROBERTA_PRETRAINED_MODEL_ARCHIVE_LIST
from transformers import BertPreTrainedModel, RobertaModel, RobertaConfig
from torchcrf import CRF
from .module import IntentClassifier, SlotClassifier, Pooler


class JointRoberta(BertPreTrainedModel):
    config_class = RobertaConfig
    pretrained_model_archive_map = ROBERTA_PRETRAINED_MODEL_ARCHIVE_LIST
    base_model_prefix = "roberta"

    def __init__(self, config: RobertaConfig, args: Any, intent_label_lst: List[str], slot_label_lst: List[str], pos_label_lst: List[str]) -> None:
        super(JointRoberta, self).__init__(config)
        self.args = args

        self.intent_label_lst = intent_label_lst
        self.slot_label_lst = slot_label_lst

        self.num_intent_labels = len(intent_label_lst)
        self.num_slot_labels = len(slot_label_lst)

        self.num_pos_labels = len(pos_label_lst)
        self.num_np_labels = 1  # len(np_label_lst)
        self.num_vp_labels = 1  # len(vp_label_lst)
        self.num_entity_labels = 1  # len(entity_label_lst)
        self.num_acronym_labels = 1  # len(acronym_label_lst)

        self.roberta = RobertaModel(config=config)  # Load pretrained bert

        hidden_size = config.hidden_size

        # TODO pos_emb = 50 should be an input variable
        if args.use_pos:
            pos_dim = 50
            hidden_size += pos_dim
            self.pos_emb = (
                nn.Embedding(self.num_pos_labels, pos_dim) if pos_dim > 0 else None
            )
        if args.use_np:
            hidden_size += self.num_np_labels
        if args.use_vp:
            hidden_size += self.num_vp_labels
        if args.use_entity:
            hidden_size += self.num_entity_labels
        if args.use_acronym:
            hidden_size += self.num_acronym_labels

        self.custom_pooler = Pooler(hidden_size=hidden_size)
        self.intent_classifier = IntentClassifier(
            hidden_size, self.num_intent_labels, args.dropout_rate
        )
        self.slot_classifier = SlotClassifier(
            hidden_size, self.num_slot_labels, args.dropout_rate
        )

        if args.use_crf:
            self.crf = CRF(num_tags=self.num_slot_labels, batch_first=True)

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        token_type_ids: torch.Tensor,
        intent_label_ids: torch.Tensor,
        slot_labels_ids: torch.Tensor,
        pos_label_ids: torch.Tensor = None,
        np_label_ids: torch.Tensor = None,
        vp_label_ids: torch.Tensor = None,
        entity_label_ids: torch.Tensor = None,
        acronym_label_ids: torch.Tensor = None
    ):
        outputs = self.roberta(
            input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids
        )  # sequence_output, pooled_output, (hidden_states), (attentions)
        sequence_output = outputs[0]
        pooled_output = outputs[1]  # [CLS]

        if self.args.use_pos:
            # torch.cat([word_emb,pos_emb], dim=2)
            pos_output = self.pos_emb(pos_label_ids)
            sequence_output = torch.cat([sequence_output, pos_output], dim=2)
        if self.args.use_np:
            sequence_output = torch.cat(
                [sequence_output, np_label_ids.unsqueeze(2)], dim=2
            )
        if self.args.use_vp:
            sequence_output = torch.cat(
                [sequence_output, vp_label_ids.unsqueeze(2)], dim=2
            )
        if self.args.use_entity:
            sequence_output = torch.cat(
                [sequence_output, entity_label_ids.unsqueeze(2)], dim=2
            )
        if self.args.use_acronym:
            sequence_output = torch.cat(
                [sequence_output, acronym_label_ids.unsqueeze(2)], dim=2
            )

        if (
            self.args.use_pos
            or self.args.use_np
            or self.args.use_vp
            or self.args.use_entity
            or self.args.use_acronym
        ):
            pooled_output = self.custom_pooler(sequence_output)

        intent_logits = self.intent_classifier(pooled_output)
        slot_logits = self.slot_classifier(sequence_output)

        total_loss = 0
        # 1. Intent Softmax
        if intent_label_ids is not None:
            if self.num_intent_labels == 1:
                intent_loss_fct = nn.MSELoss()
                intent_loss = intent_loss_fct(
                    intent_logits.view(-1), intent_label_ids.view(-1)
                )
            else:
                intent_loss_fct = nn.CrossEntropyLoss()
                intent_loss = intent_loss_fct(
                    intent_logits.view(-1, self.num_intent_labels),
                    intent_label_ids.view(-1),
                )
            total_loss += intent_loss

        # 2. Slot Softmax
        if slot_labels_ids is not None:
            if self.args.use_crf:
                slot_loss = self.crf(
                    slot_logits,
                    slot_labels_ids,
                    mask=attention_mask.byte(),
                    reduction="mean",
                )
                slot_loss = -1 * slot_loss  # negative log-likelihood
            else:
                slot_loss_fct = nn.CrossEntropyLoss(ignore_index=self.args.ignore_index)
                # Only keep active parts of the loss
                if attention_mask is not None:
                    active_loss = attention_mask.view(-1) == 1
                    active_logits = slot_logits.view(-1, self.num_slot_labels)[
                        active_loss
                    ]
                    active_labels = slot_labels_ids.view(-1)[active_loss]
                    slot_loss = slot_loss_fct(active_logits, active_labels)
                else:
                    slot_loss = slot_loss_fct(
                        slot_logits.view(-1, self.num_slot_labels),
                        slot_labels_ids.view(-1),
                    )
            total_loss += self.args.slot_loss_coef * slot_loss

        outputs = ((intent_logits, slot_logits),) + outputs[
            2:
        ]  # add hidden states and attention if they are here

        outputs = (total_loss,) + outputs

        return outputs  # (loss), logits, (hidden_states), (attentions) # Logits is a tuple of intent and slot logits
