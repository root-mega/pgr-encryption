function Il2cppToString(str: NativePointer): string {
    return str.add(20).readUtf16String(str.add(16).readS32())!;
}

export class Debug {
    static InitHook(base: NativePointer) {
        Interceptor.attach(base.add(0x98E3C0), {
            onEnter(args): void {
                console.log("[DEBUG] " + Il2cppToString(args[0]));
            }
        })

        Interceptor.attach(base.add(0x98F9D0), {
            onEnter(args): void {
                console.log("[WARN] " + Il2cppToString(args[0]));
            }
        })

        Interceptor.attach(base.add(0x98EED0), {
            onEnter(args): void {
                console.log("[ERROR] " + Il2cppToString(args[0]));
            }
        })
    }
}