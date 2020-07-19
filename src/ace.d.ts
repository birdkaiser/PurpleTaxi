type AceLibraryName =
    | "AceAddon-3.0"
    | "AceBucket-3.0"
    | "AceComm-3.0"
    | "AceConfig-3.0"
    | "AceConfigCmd-3.0"
    | "AceConfigRegistry-3.0"
    | "AceConsole-3.0"
    | "AceDB-3.0"
    | "AceDBOptions-3.0"
    | "AceEvent-3.0"
    | "AceGUI-3.0"
    | "AceHook-3.0"
    | "AceLocale-3.0"
    | "AceSerializer-3.0"
    | "AceTab-3.0"
    | "AceTimer-3.0";

declare class AceAddon {
    Print(this: void, str: string): void;
    OnInitialize(): void;
    OnEnable(): void;
    OnDisable(): void;
    RegisterChatCommand(name: string, fnName: string): void;
}

declare class AceAddonLibStub {
    NewAddon(addonName: string, ...libNames: AceLibraryName[]): AceAddon;
}

type AddonChannelId = "PARTY" | "RAID" | "GUILD" | "OFFICER" | "BATTLEGROUND";
declare class AceCommLibStub {
    RegisterComm(prefix: string, methodName: string): void;
    SendCommMessage(prefix: string, text: string, distribution: AddonChannelId): void;
    SendCommMessage(prefix: string, text: string, distribution: "WHISPER", target: string): void;
}

declare class AceLocaleLibStub {
    GetLocale<TLocaleTable>(addonName: string, silent?: boolean): TLocaleTable;
    NewLocale<TLocaleTable>(addonName: string, localeName: string, isDefault: boolean, silent?: boolean | 'raw'): TLocaleTable;
}

declare class AceGuiWidgetBase {
    SetWidth(val: number): void;
    SetRelativeWidth(val: number): void;
    SetHeight(val: number): void;
    IsVisible(): boolean;
    IsShown(): boolean;
    Release(): void;
    SetPoint(...args: any[]): void; // TODO: figure out parameters
    GetNumPoints(): number;
    GetPoint(): any; // TODO: figure out parameters and return type
    ClearAllPoints(): void;
    GetUserDataTable(): { readonly [k in string]: unknown };
    SetUserData<T>(key: string, val: T): void;
    GetUserData<T>(key: string): T | null;
    SetFullHeight(val: boolean): void;
    IsFullHeight(): boolean;
    SetFullWidth(val: boolean): void;
    IsFullWidth(): boolean;
}

declare class GuiButton extends AceGuiWidgetBase {
    SetText(val: string): void;
    SetDisabled(val: boolean): void;
    SetCallback(name: "OnClick", fn: () => void): void;
    SetCallback(name: "OnEnter", fn: () => void): void;
    SetCallback(name: "OnLeave", fn: () => void): void;
}

declare class GuiCheckBox extends AceGuiWidgetBase {
    SetValue(val: boolean | null): void;
    GetValue(): boolean | null;
    SetType(val: "radio" | "checkbox"): void;
    ToggleChecked(): void;
    SetLabel(val: string): void;
    SetTriState(val: boolean): void;
    SetDisabled(val: boolean): void;
    SetDescription(val: string): void;
    SetImage(path: string): void; // TODO: There are more parameters to describe the image
    SetCallback(name: "OnValueChanged", fn: (value: boolean | null) => void): void;
    SetCallback(name: "OnEnter", fn: () => void): void;
    SetCallback(name: "OnLeave", fn: () => void): void;
}

declare class GuiColorPicker extends AceGuiWidgetBase {
    // TODO
}

declare class GuiDropdown extends AceGuiWidgetBase {
    // TODO
}

declare class GuiEditBox extends AceGuiWidgetBase {
    // TODO
}

declare class GuiHeading extends AceGuiWidgetBase {
    SetText(val: string): void;
}

declare class GuiIcon extends AceGuiWidgetBase {
    SetImage(path: string): void; // TODO: There are more parameters to describe the image
    SetImageSize(width: number, height: number): void;
    SetLabel(text: string): void;
    SetCallback(name: "OnClick", fn: (button: any) => void): void; // TODO: what is the button?
    SetCallback(name: "OnEnter", fn: () => void): void;
    SetCallback(name: "OnLeave", fn: () => void): void;
}

declare class GuiInteractiveLabel extends AceGuiWidgetBase {
    // TODO
}

declare class GuiKeybinding extends AceGuiWidgetBase {
    // TODO
}

type Font = any; // TODO: figure this out
declare class GuiLabel extends AceGuiWidgetBase {
    SetText(text: string): void;
    SetColor(r: number, g: number, b: number): void;
    SetFont(font: Font, height: number, flags: any): void; // TODO: check these parameters
    SetFontObject(font: Font): void;
    SetImage(path: string): void; // TODO: There are more parameters to describe the image
    SetImageSize(width: number, height: number): void;
}

declare class GuiMultiLineEditBox extends AceGuiWidgetBase {
    // TODO
}

declare class GuiSlider extends AceGuiWidgetBase {
    // TODO
}

declare abstract class AceGuiContainerWidgetBase extends AceGuiWidgetBase {
    AddChild(widget: GuiWidget, beforeWidget?: GuiWidget): void;
    SetLayout(layout: "Flow" | "List" | "Fill"): void;
    SetAutoAdjustHeight(flag: boolean): void;
    ReleaseChildren(): void;
    DoLayout(): void;
    PauseLayout(): void;
    ResumeLayout(): void;
}

declare class GuiDropdownGroup extends AceGuiContainerWidgetBase {
    SetTitle(text: string): void;
    // TODO
}

declare class GuiFrame extends AceGuiContainerWidgetBase {
    SetTitle(text: string): void;
    SetStatusText(text: string): void;
    SetStatusTable(table: any): void;
    ApplyStatus(): void;
    SetCallback(name: "OnClose", fn: () => void): void;
    SetCallback(name: "OnEnterStatusBar", fn: () => void): void;
    SetCallback(name: "OnLeaveStatusBar", fn: () => void): void;
}

declare class GuiInlineGroup extends AceGuiContainerWidgetBase {
    SetTitle(text: string): void;
}

declare class GuiScrollFrame extends AceGuiContainerWidgetBase {
    SetScroll(val: number): void;
    SetStatusTable(table: any): void;
}

declare class GuiSimpleGroup extends AceGuiContainerWidgetBase {
}

declare class GuiTabGroup extends AceGuiContainerWidgetBase {
    // TODO
}

declare class GuiTreeGroup extends AceGuiContainerWidgetBase {
    // TODO
}

type GuiWidget =
    | GuiButton
    | GuiCheckBox
    | GuiColorPicker
    | GuiDropdown
    | GuiEditBox
    | GuiHeading
    | GuiIcon
    | GuiInteractiveLabel
    | GuiKeybinding
    | GuiLabel
    | GuiMultiLineEditBox
    | GuiSlider;

declare class AceGuiLibStub {
    // Regular widgets
    Create(type: "Button"): GuiButton;
    Create(type: "CheckBox"): GuiCheckBox;
    Create(type: "ColorPicker"): GuiColorPicker;
    Create(type: "Dropdown"): GuiDropdown;
    Create(type: "EditBox"): GuiEditBox;
    Create(type: "Heading"): GuiHeading;
    Create(type: "Icon"): GuiIcon;
    Create(type: "InteractiveLabel"): GuiInteractiveLabel;
    Create(type: "Keybinding"): GuiKeybinding;
    Create(type: "Label"): GuiLabel;
    Create(type: "MultiLineEditBox"): GuiMultiLineEditBox;
    Create(type: "Slider"): GuiSlider;
    
    // Containers
    Create(type: "DropdownGroup"): GuiDropdownGroup;
    Create(type: "Frame"): GuiFrame;
    Create(type: "InlineGroup"): GuiInlineGroup;
    Create(type: "ScrollFrame"): GuiScrollFrame;
    Create(type: "SimpleGroup"): GuiSimpleGroup;
    Create(type: "TabGroup"): GuiTabGroup;
    Create(type: "TreeGroup"): GuiTreeGroup;
}

declare class AceConfigCmdLibStub {
    HandleCommand(slashCommand: string, appName: string, input: string): void;
}

interface OptionBase {
    readonly name: string;
    readonly desc?: string | (() => string);
    readonly descStyle?: "inline";
    readonly validate?: (() => boolean) | false;
    // readonly confirm?: (() => string | boolean) | boolean; // TODO: need to figure out these types
    readonly order?: number | (() => number);
    readonly disabled?: boolean | (() => boolean);
    readonly hidden?: boolean | (() => boolean);
    readonly guiHidden?: boolean;
    readonly dialogHidden?: boolean;
    readonly dropdownHidden?: boolean;
    readonly cmdHidden?: boolean;
    readonly icon?: string | (() => string);
    readonly width?: "double" | "half" | "full" | "normal" | number;
}

interface ExecuteOption extends OptionBase {
    readonly type: "execute";
    readonly func: () => void;
    readonly image?: string;
}

interface InputOption extends OptionBase {
    readonly type: "input";
    readonly get: () => string;
    readonly set: (val: string) => void;
    readonly multiline?: boolean | number;
    readonly pattern?: string;
    readonly usage?: string;
}

interface ToggleOption extends OptionBase {
    readonly type: "toggle";
    readonly tristate: false;
    readonly get: () => boolean;
    readonly set: (val: boolean) => void;
}

interface TriStateToggleOption extends OptionBase {
    readonly type: "toggle";
    readonly tristate: true;
    readonly get: () => (boolean | null);
    readonly set: (val: boolean | null) => void;
}

interface RangeOption extends OptionBase {
    readonly type: "range";
    readonly min: number;
    readonly max: number;
    readonly softMin?: number;
    readonly softMax?: number;
    readonly step?: number;
    readonly bigStep?: number;
    readonly get: () => number;
    readonly set: (val: number) => void;
    readonly isPercent?: boolean;
}

type SelectOptionValues = { readonly [k in string]: string };

interface SelectOption extends OptionBase {
    readonly type: "select";
    readonly values: SelectOptionValues | (() => SelectOptionValues);
    // TODO: need to figure out these types
    // readonly sorting?: () => [string];
    // readonly get: (key: string) => string;
    // readonly set: (key: string, value: string) => void;
    readonly style?: "dropdown" | "radio";
}

interface MultiSelectOption extends OptionBase {
    readonly type: "multiselect";
    // TODO: need to figure out these types
    // readonly values: SelectOptionValues | (() => SelectOptionValues);
    // readonly sorting?: () => [string];
    // readonly get: (key: string) => string;
    // readonly set: (key: string, value: string) => void;
    // readonly style?: "dropdown" | "radio";
}

type Rgba = [number, number, number, number];
interface ColorOption extends OptionBase {
    readonly type: "color";
    readonly get: () => Rgba;
    readonly set: (val: Rgba) => void;
    readonly hasAlpha?: boolean;
}

interface KeybindingOption extends OptionBase {
    readonly type: "keybinding";
    // TODO: need to figure out these types
    // readonly get: () => string;
    // readonly set: (value: string) => void;
}

interface HeaderOption extends OptionBase {
    readonly type: "header";
    readonly name: string;
}

interface DescriptionOption extends OptionBase {
    readonly type: "description";
    readonly name: "string";
    readonly fontSize?: "large" | "medium" | "small";
    readonly image?: string;
}

interface GroupOption extends OptionBase {
    readonly type: "group";
    readonly args: { readonly [k in string]: OptionsNode };
    //readonly plugins: []; // TODO: what is this?
    readonly childGroups?: "tree" | "tabs" | "select";
    readonly inline?: boolean;
    readonly cmdInline?: boolean;
    readonly guiInline?: boolean;
    readonly dropdownInline?: boolean;
    readonly dialogInline?: boolean;
}

type OptionsNode =
    | ExecuteOption
    | InputOption
    | ToggleOption
    | TriStateToggleOption
    | RangeOption
    | SelectOption
    | MultiSelectOption
    | ColorOption
    | KeybindingOption
    | HeaderOption
    | DescriptionOption
    | GroupOption;

declare class AceConfigRegistryLibStub {
    RegisterOptionsTable(addonName: string, table: GroupOption): void;
}

declare class AceSerializerLibStub {
    /** @tupleReturn */
    Deserialize(str: string): [boolean, any];
    Serialize(val: unknown): string;
}

declare const LibStub: <T extends AceLibraryName>(this: void, name: T) =>
    T extends "AceAddon-3.0" ? AceAddonLibStub :
    T extends "AceComm-3.0" ? AceCommLibStub :
    T extends "AceLocale-3.0" ? AceLocaleLibStub :
    T extends "AceGUI-3.0" ? AceGuiLibStub :
    T extends "AceConfigCmd-3.0" ? AceConfigCmdLibStub :
    T extends "AceConfigRegistry-3.0" ? AceConfigRegistryLibStub :
    T extends "AceSerializer-3.0" ? AceSerializerLibStub :
    never;