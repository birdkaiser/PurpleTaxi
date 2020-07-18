const AceGUI = LibStub("AceGUI-3.0");

export class MainWindowState {
    constructor() {
        const mainWindowFrame = AceGUI
    }
}

export interface StateOptions {
    readonly mainWindowDidChangeVisibility: (visible: boolean) => void;
}

export class State {
    private mainWindowState: MainWindowState | null = null;
    private options: StateOptions;

    constructor(options: StateOptions) {
        this.options = options;
    }

    public toggleMainWindow() {
        if (this.mainWindowState) {
            this.mainWindowState = null;
        } else {
            this.mainWindowState = new MainWindowState();
        }
        this.options.mainWindowDidChangeVisibility(!!this.mainWindowState);
    }
}