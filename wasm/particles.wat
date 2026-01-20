;; WebAssembly module for high-performance particle calculations
(module
  (memory (export "memory") 1)
  
  ;; Calculate particle positions (optimized)
  (func $updateParticles
    (param $count i32)
    (param $deltaTime f32)
    (param $width f32)
    (param $height f32)
    (local $i i32)
    (local $x f32)
    (local $y f32)
    (local $vx f32)
    (local $vy f32)
    
    (local.set $i (i32.const 0))
    (loop $loop
      (if (i32.lt_s (local.get $i) (local.get $count))
        (then
          ;; Calculate index (each particle is 5 floats: x, y, vx, vy, size)
          (local.set $x (f32.load (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4))))
          (local.set $y (f32.load offset=4 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4))))
          (local.set $vx (f32.load offset=8 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4))))
          (local.set $vy (f32.load offset=12 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4))))
          
          ;; Update position
          (local.set $x (f32.add (local.get $x) (f32.mul (local.get $vx) (local.get $deltaTime))))
          (local.set $y (f32.add (local.get $y) (f32.mul (local.get $vy) (local.get $deltaTime))))
          
          ;; Boundary collision
          (if (f32.lt (local.get $x) (f32.const 0))
            (then (local.set $vx (f32.neg (local.get $vx)))))
          (if (f32.gt (local.get $x) (local.get $width))
            (then (local.set $vx (f32.neg (local.get $vx)))))
          (if (f32.lt (local.get $y) (f32.const 0))
            (then (local.set $vy (f32.neg (local.get $vy)))))
          (if (f32.gt (local.get $y) (local.get $height))
            (then (local.set $vy (f32.neg (local.get $vy)))))
          
          ;; Store back
          (f32.store (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4)) (local.get $x))
          (f32.store offset=4 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4)) (local.get $y))
          (f32.store offset=8 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4)) (local.get $vx))
          (f32.store offset=12 (i32.mul (i32.mul (local.get $i) (i32.const 5)) (i32.const 4)) (local.get $vy))
          
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $loop)
        )
      )
    )
  )
  
  (export "updateParticles" (func $updateParticles))
)
