import { Config } from "./config.js";

function replaceHostname(url: string): string {
    const protocolEnd = url.indexOf('//') + 2;
    const pathStart = url.indexOf('/', protocolEnd);
    const newUrl = url.substring(0, protocolEnd) + Config.redirData.ip + ":" + Config.redirData.port.toString() + url.substring(pathStart);

    return newUrl;
}


export class Redir {
    static WebRequestSetUrlPtr: NativePointer = ptr(0x2AAE950);
    static UriCtorPtr: NativePointer = ptr(0x1A8E0E0);

    static Il2cppToString(str: NativePointer): string {
        return str.add(20).readUtf16String(str.add(16).readS32())!;
    }

    static InitHook(base: NativePointer): void {
        Interceptor.attach(base.add(this.WebRequestSetUrlPtr), {
            onEnter: function(args) {
                var requestUrl = Redir.Il2cppToString(args[1]);
                if (requestUrl.startsWith("http://") || requestUrl.startsWith("https://")) {
                    if (requestUrl.includes(Config.redirData.ip + ":" + Config.redirData.port)) return;
                    
                    var prefix = requestUrl.split('/', 3).join('/');
                    args[1] = Redir.Il2CppNewUtf16(replaceHostname(requestUrl));
                    
                    console.log("[Redir] Successfully redirected " + requestUrl);
                }
            }
        })

        Interceptor.attach(base.add(this.UriCtorPtr), {
            onEnter: function(args) {
                var requestUrl = Redir.Il2cppToString(args[1]);
                if (requestUrl.startsWith("http://") || requestUrl.startsWith("https://")) {
                    if (requestUrl.includes(Config.redirData.ip + ":" + Config.redirData.port)) return;
                    
                    var prefix = requestUrl.split('/', 3).join('/');
                    args[1] = Redir.Il2CppNewUtf16(replaceHostname(requestUrl));
                    
                    console.log("[Redir] Successfully redirected " + requestUrl);
                }
            }
        })
        
        console.log("[Redir] Started hooks!");
    }

    static Il2CppNewUtf16(text: string) {
        const alloc_string = Memory.allocUtf16String(text);
        return new NativeFunction(Module.getExportByName("GameAssembly.dll", "il2cpp_string_new_utf16"), 'pointer', ['pointer', 'int'])(alloc_string, text.length)
    }
}
