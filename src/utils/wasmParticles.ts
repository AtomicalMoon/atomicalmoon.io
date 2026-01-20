export type WasmParticles = {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  updateParticles: (count: number, deltaTime: number, width: number, height: number) => void;
  floatView: Float32Array;
};

export async function loadWasmParticles(path = '/particles.wasm'): Promise<WasmParticles> {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to fetch WASM: ${resp.status}`);

  const result = await WebAssembly.instantiateStreaming(resp, {} as WebAssembly.Imports).catch(async () => {
    const bytes = await resp.arrayBuffer();
    return await WebAssembly.instantiate(bytes, {} as WebAssembly.Imports);
  });

  const instance = result.instance as WebAssembly.Instance;
  const exports = instance.exports as any;
  if (!exports.updateParticles || !exports.memory) throw new Error('WASM module missing exports');

  const memory = exports.memory as WebAssembly.Memory;
  const floatView = new Float32Array(memory.buffer);

  return {
    instance,
    memory,
    updateParticles: (exports.updateParticles as Function).bind(instance) as any,
    floatView,
  };
}
