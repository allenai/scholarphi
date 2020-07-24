/**
 * Configurable app-wide settings. Whenever an experimental feature is added that should be
 * possible to toggle on / off (either during development, or when sharing a prototype with
 * a user / the team), add it to this list of settings instead of 'state' above. Settings from this
 * list can be configured in a developer's toolbar, and might eventually be set using
 * query parameters.
 */
export interface Settings {
  /**
   * Style annotations to show hints that they're there (e.g., underlines).
   */
  annotationHintsEnabled: boolean;
  /**
   * Enable the 'declutter' interaction which masks pages to show only those sentences that
   * contain an entity that the user selected.
   */
  declutterEnabled: boolean;
  /**
   * Show preview of the definition of a symbol a corner of the screen when that definition
   * is not already on the screen.
   */
  definitionPreviewEnabled: boolean;
  /**
   * Show menu of actions when text is selected.
   */
  textSelectionMenuEnabled: boolean;
  /**
   * Enable the annotation of new entities in the paper.
   */
  entityCreationEnabled: boolean;
  /**
   * Show the entity property editor for a selected entity.
   */
  entityEditingEnabled: boolean;
  /**
   * The presentation format of glosses (i.e., as tooltips, sidenotes, etc.)
   */
  glossStyle: GlossStyle;
  /**
   * Replace gloss contents with widgets for users to annotate the quality of gloss contents.
   */
  glossEvaluationEnabled: boolean;
  /**
   * Copy the TeX for sentences when a sentence is clicked on. Normally, this should probably be
   * disabled as it interferes with built-in text selection in pdf.js.
   */
  sentenceTexCopyOnOptionClickEnabled: boolean;
}

/**
 * A specification declaring how a setting should appear in a settings editor.
 */
export interface ConfigurableSetting {
  key: keyof Settings;
  /**
   * A setting can be one of the following types:
   * * flag: boolean yes / no option (can be switched on / off)
   * * choice: selection among multiple choices
   */
  type: "flag" | "choice";
  label: string;
  /**
   * Must be defined if 'type' is "choice".
   */
  choices?: string[];
}

export const GLOSS_STYLES = ["tooltip", "sidenote"] as const;
export type GlossStyle = typeof GLOSS_STYLES[number];

/**
 * Any setting that should be editable from the settings editor should have a spec in this list.
 */
export const CONFIGURABLE_SETTINGS: ConfigurableSetting[] = [
  { key: "annotationHintsEnabled", type: "flag", label: "Annotation hints" },
  {
    key: "glossStyle",
    type: "choice",
    label: "Gloss style",
    choices: [...GLOSS_STYLES],
  },
  {
    key: "glossEvaluationEnabled",
    type: "flag",
    label: "Gloss evaluation interface",
  },
  {
    key: "textSelectionMenuEnabled",
    type: "flag",
    label: "Text selection menu",
  },
  {
    key: "declutterEnabled",
    type: "flag",
    label: "Declutter interaction",
  },
  {
    key: "definitionPreviewEnabled",
    type: "flag",
    label: "Definition preview",
  },
  {
    key: "entityCreationEnabled",
    type: "flag",
    label: "Entity creation toolbar",
  },
  {
    key: "entityEditingEnabled",
    type: "flag",
    label: "Entity property editor",
  },
  {
    key: "sentenceTexCopyOnOptionClickEnabled",
    type: "flag",
    label: "Copy sentence TeX on Opt+Click",
  },
];
