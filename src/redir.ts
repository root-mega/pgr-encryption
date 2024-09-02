import { Config } from "./config.js";

export class URL {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;

    constructor(url: string) {
        const urlParts = url.split("://");
        this.protocol = urlParts[0];
        const rest = urlParts[1] || '';

        const [hostAndPort, ...pathParts] = rest.split("/");
        const [host, port] = hostAndPort.split(":");
        this.hostname = host || '';
        this.port = port || '';
        this.pathname = pathParts.join("/") || '';
    }

    toString(): string {
        return `${this.protocol}://${this.hostname}${this.port ? ':' + this.port : ''}/${this.pathname}`;
    }
}

export class Redir {
    static SendWebRequestPtr: NativePointer = ptr(0x2AAA860);
    static CreateStringPtr: NativePointer = ptr(0x1D20A40);

    static Il2cppToString(str: NativePointer): string {
        return str.add(20).readUtf16String(str.add(16).readS32())!;
    }

    static InitHook(base: NativePointer): void {
        console.log("[Redir] Started hooks!");

        Interceptor.replace(base.add(this.SendWebRequestPtr), new NativeCallback((a: NativePointer): NativePointer => {
            const originalUrl = this.Il2cppToString(a);
            if (originalUrl.includes("icanhazip")) {
                console.log(`[Redir] SendWebRequest: ${originalUrl}`);
                return this.SendWebRequest(originalUrl);
            } else {
                const url = new URL(originalUrl);

                url.hostname = Config.redirData.ip;
                url.port = Config.redirData.port;

                const modifiedUrl = url.toString();
                console.log(`[Redir] SendWebRequest: ${modifiedUrl}`);
                return this.SendWebRequest(modifiedUrl);
            }
        }, "pointer", ["pointer"]));
    }

    static CreateString(string: string): NativePointer {
        const createStringFunc = new NativeFunction(Process.getModuleByName("GameAssembly.dll").base.add(this.CreateStringPtr), "pointer", ["pointer"]);
        return createStringFunc(Memory.allocUtf8String(string));
    }

    static SendWebRequest(uri: string): NativePointer {
        const sendWebRequestFunc = new NativeFunction(Process.getModuleByName("GameAssembly.dll").base.add(this.SendWebRequestPtr), "pointer", ["pointer"]);
        return sendWebRequestFunc(this.CreateString(uri));
    }
}
