type RangeCheckerFn = (this: void, unit: string) => boolean;

interface LibRangeCheckLibStub {
    RegisterCallback: <T>(this: void, obj: T, eventName: string, methodName: string) => void;
    GetFriendMaxChecker(yards: number): RangeCheckerFn;
}