-- Represents a complete paper within our schema.
create table paper(
  id            bigserial primary key,
  arxiv_id      text,
  arxiv_version integer,
  created_at    timestamp without time zone not null, -- necessary?
  updated_at    timestamp without time zone,  -- necessary?
  constraint arxiv_id_version_uq unique (arxiv_id, arxiv_version)
);
create index paper_arxiv_id_version on paper(arxiv_id);

-- One-to-many relation between papers and S2 IDs for that paper,
-- since S2 IDs will shift over time.
create table s2id(
  paper_id    bigint not null references paper(id),
  s2_id       text not null,
  constraint paper_s2id_uq unique (paper_id, s2_id)
);
create index s2id_paper_id on s2id(paper_id);
create index s2id_s2_id on s2id(s2_id);

-- entity data unique to citations
create table citation(
  id          bigserial primary key,
  cites       text not null
);

-- just assuming this is going to exist?
create table equation(
  id              bigserial primary key,
  text            text, -- would we have this or just the TeX?
  tex             text
);

-- entity data unique to symbols
create table symbol(
  id                bigserial primary key,
  normalized_mathml text,
  tex               text,
  -- TODO: should these both reference entity(id)?
  equation_id       bigint not null references equation(id),
  parent_id         bigint not null references symbol(id)
);
create index symbol_equation_id on symbol(equation_id);
create index symbol_parent_id on symbol(parent_id);

create table sentence(
  id              bigserial primary key,
  text            text,
  tex             text
);

create table term(
  id              bigserial primary key,
  text            text,
  tex             text
);

create table definition(
  id              bigserial primary key,
  text            text
);

-- base entity data present in all entity types
-- this also provides IDs for clients to use to identify
-- the various entities
create table entity(
  id            bigserial primary key,
  paper_id      integer not null references paper(id),
  created_at    timestamp without time zone not null,
  updated_at    timestamp without time zone,
  kind          text, -- enumeration of which type of entity this is
  -- Link out to more detailed entity info records.
  -- Only one of these is expected to be non-null per entity
  -- These IDs can effectively be hidden from the application code
  -- and are only necessary for joins
  citation_id   bigint references citation(id),
  symbol_id     bigint references symbol(id),
  equation_id   bigint references equation(id),
  definition_id bigint references definition(id),
  term_id       bigint references term(id),
  sentence_id   bigint references sentence(id)
);
create index entity_paper_id on entity(paper_id);
-- Maybe add these indexes to speed up reads at the cost of writes.
create index entity_citation_id on entity(citation_id);
create index entity_symbol_id on entity(symbol_id);
create index entity_equation_id on entity(equation_id);
create index entity_definition_id on entity(definition_id);
create index entity_term_id on entity(term_id);
create index entity_sentence_id on entity(sentence_id);

-- Stores bounding box data for entities
-- TODO: Would it make sense to encode paper IDs in here to go with page number?
create table boundingbox(
  id          bigserial primary key,
  entity_id   bigint not null references entity(id),
  page        integer,
  "left"        decimal,
  top         decimal,
  width       decimal,
  height      decimal
);
create index boundingbox_entity_id on boundingbox(entity_id);
create index boundingbox_page on boundingbox(page);

-- Link table recording what entities appear in what sentences
-- Could be folded into the entity subtypes that need to point to a definition
create table appears_in_sentence(
  -- Using entity ID here because multiple types of entities can appear in sentences.
  entity_id       bigint not null references entity(id),
  -- TODO: Reference sentence directly or use the "external" entity ID?
  sentence_id     bigint not null references sentence(id),
  constraint entity_sentence_uq unique (entity_id, sentence_id)
);

-- Link table recording the M:M relation between entities and their definitions
create table entity_definition(
  entity_id       bigint references entity(id),
  definition_id   bigint references definition(id),
  constraint entity_definition_uq unique (entity_id, definition_id)
);
