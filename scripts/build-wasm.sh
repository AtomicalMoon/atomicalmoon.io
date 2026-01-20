#!/bin/bash
# Build WebAssembly module from WAT source

echo "Building WebAssembly module..."

# Check if wat2wasm is available
if ! command -v wat2wasm &> /dev/null; then
    echo "wat2wasm not found. Installing wabt..."
    echo "Please install wabt: https://github.com/WebAssembly/wabt"
    exit 1
fi

wat2wasm wasm/particles.wat -o public/particles.wasm

echo "✅ WebAssembly module built successfully!"
