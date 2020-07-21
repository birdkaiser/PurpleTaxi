type RangeCheckerFn = (this: void, unit: string) => boolean;

interface LibRangeCheckLibStub {
    RegisterCallback: (this: void, obj: any, eventName: string, methodName: string) => void;
    GetFriendMaxChecker(yards: number): RangeCheckerFn;
}