import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform int uLineCount;

#define PI 3.1415926538
#define MAX_LINES 25

const float u_line_width = 5.0;
const float u_line_blur = 8.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < MAX_LINES; i++) {
        if (i >= uLineCount) break;
        float p = float(i) / float(uLineCount);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const Threads = ({ color = [1, 1, 1], amplitude = 1, distance = 0, enableMouseInteraction = false, lineCount = 18, ...rest }) => {
  const containerRef = useRef(null);
  const animationFrameId = useRef();

    // --- LERP TARGETS (REFS) ---
    const targetColorRef = useRef(new Color(...color));
    const targetAmplitudeRef = useRef(amplitude);
    const targetDistanceRef = useRef(distance);

    // Update targets when props change
    useEffect(() => {
        targetColorRef.current.set(...color);
        targetAmplitudeRef.current = amplitude;
        targetDistanceRef.current = distance;
    }, [color, amplitude, distance]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const isMobile = window.innerWidth <= 768;
        const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5);
        
        const renderer = new Renderer({ 
            alpha: false, 
            antialias: false,
            dpr: dpr
        });
        
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        container.appendChild(gl.canvas);

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: vertexShader,
          fragment: fragmentShader,
          uniforms: {
            iTime: { value: 0 },
            iResolution: {
              value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
            },
            uColor: { value: new Color(...color) },
            uAmplitude: { value: amplitude },
            uDistance: { value: distance },
            uMouse: { value: new Float32Array([0.5, 0.5]) },
            uLineCount: { value: lineCount }
          }
        });

        const mesh = new Mesh(gl, { geometry, program });
        
        function resize() {
          const { clientWidth, clientHeight } = container;
          renderer.setSize(clientWidth, clientHeight);
          program.uniforms.iResolution.value.r = gl.canvas.width;
          program.uniforms.iResolution.value.g = gl.canvas.height;
          program.uniforms.iResolution.value.b = gl.canvas.width / gl.canvas.height;
        }
        window.addEventListener('resize', resize);
        resize();

        let currentMouse = [0.5, 0.5];
        let targetMouse = [0.5, 0.5];

        function handleMouseMove(e) {
          const x = e.clientX / window.innerWidth;
          const y = 1.0 - (e.clientY / window.innerHeight);
          targetMouse = [x, y];
        }
        function handleMouseLeave() {
          targetMouse = [0.5, 0.5];
        }
        if (enableMouseInteraction) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseleave', handleMouseLeave);
        }

        function update(t) {
          const lerpSpeed = 0.05;
          const targetColor = targetColorRef.current;
          
          program.uniforms.uColor.value.r += (targetColor.r - program.uniforms.uColor.value.r) * lerpSpeed;
          program.uniforms.uColor.value.g += (targetColor.g - program.uniforms.uColor.value.g) * lerpSpeed;
          program.uniforms.uColor.value.b += (targetColor.b - program.uniforms.uColor.value.b) * lerpSpeed;
          
          program.uniforms.uAmplitude.value += (targetAmplitudeRef.current - program.uniforms.uAmplitude.value) * lerpSpeed;
          program.uniforms.uDistance.value += (targetDistanceRef.current - program.uniforms.uDistance.value) * lerpSpeed;

          if (enableMouseInteraction) {
            const mouseSmoothing = 0.05;
            currentMouse[0] += mouseSmoothing * (targetMouse[0] - currentMouse[0]);
            currentMouse[1] += mouseSmoothing * (targetMouse[1] - currentMouse[1]);
            program.uniforms.uMouse.value[0] = currentMouse[0];
            program.uniforms.uMouse.value[1] = currentMouse[1];
          } else {
            program.uniforms.uMouse.value[0] = 0.5 + Math.sin(t * 0.0007) * 0.1;
            program.uniforms.uMouse.value[1] = 0.5 + Math.cos(t * 0.0005) * 0.1;
          }
          program.uniforms.iTime.value = t * 0.001;

          renderer.render({ scene: mesh });
          animationFrameId.current = requestAnimationFrame(update);
        }
        
        animationFrameId.current = requestAnimationFrame(update);

        return () => {
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
          window.removeEventListener('resize', resize);
          if (enableMouseInteraction) {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
          }
          if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [enableMouseInteraction, lineCount]);

  return <div ref={containerRef} className="threads-container" {...rest} />;
};

export default Threads;
