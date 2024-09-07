import { Config } from "./config.js";
import { Debug } from "./debug.js";
import { Redir } from "./redir.js";

function writeMemory(address: NativePointer, data: Uint8Array): void {
    Memory.protect(address, data.length, "rwx");
    address.writeByteArray(Array.from(data));
    Memory.protect(address, data.length, "r-x");
}

async function main(): Promise<void> {
    console.log("[Patch] Encryption & redirection patch for Punishing: Gray Raven")

    let GameAssembly: Module | null = Process.findModuleByName("GameAssembly.dll");

    while (GameAssembly === null) {
        console.log("[Patch] GameAssembly isn't loaded. Waiting two seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        GameAssembly = Process.findModuleByName("GameAssembly.dll");
    }

    if (GameAssembly !== null) {
        console.log(`[Patch] GA: ${GameAssembly.base}`);
        
        if (Config.patchEncryption == true) {
            const patch = new Uint8Array([0x90, 0x90, 0x90, 0x90, 0x90]); // nop x5
            writeMemory(GameAssembly.base.add(0x8da98b), patch);
            writeMemory(GameAssembly.base.add(0x8d8cfa), patch);
            console.log("[Encryption] Patched encryption!");
        }
        
        if (Config.useRedir) {
            try {
                Redir.InitHook(GameAssembly.base);
            } catch (error) {
                console.error("[Redir] Failed to initialize hook:", error);
            }
        }

        if (Config.useDebug) {
            Debug.InitHook(GameAssembly.base);
        }

    } else {
        console.error("[Patch] GameAssembly module could not be found.");
    }
}

main().catch(error => console.error("An error occurred in the main function:", error));
