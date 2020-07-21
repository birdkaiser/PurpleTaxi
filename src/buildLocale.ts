function buildLocale(this: void, strings: PurpleTaxiTranslationKeys, localeName: string, isDefault: boolean): void {
    const AceLocale = LibStub("AceLocale-3.0");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = AceLocale.NewLocale<any>("PurpleTaxi", localeName, isDefault, true);

    for (const key in strings) {
        L[key] = strings[key as keyof PurpleTaxiTranslationKeys];
    }
}

export default buildLocale;