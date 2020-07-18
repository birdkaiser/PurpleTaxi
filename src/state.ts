const AceGUI = LibStub("AceGUI-3.0");

interface MainWindowStateOptions {
    readonly didClose: () => void;
}

class MainWindowState {
    private options: MainWindowStateOptions;
    private mainWindowFrame: GuiFrame;

    constructor(options: MainWindowStateOptions) {
        this.options = options;

        const mainWindowFrame = AceGUI.Create("Frame");
        mainWindowFrame.SetTitle("Purple Taxi");
        mainWindowFrame.SetCallback("OnClose", () => { this.releaseMainWindow(); });
        this.mainWindowFrame = mainWindowFrame;
    }

    public releaseMainWindow() {
        this.mainWindowFrame.Release();
        this.options.didClose();
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
            this.mainWindowState.releaseMainWindow();
        } else {
            this.mainWindowState = new MainWindowState({
                didClose: () => {
                    this.mainWindowState = null;
                    this.options.mainWindowDidChangeVisibility(false);
                }
            });
            this.options.mainWindowDidChangeVisibility(true);
        }
    }
}