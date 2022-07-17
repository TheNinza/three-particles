varying float vNoise;
varying vec2 vUv;
uniform sampler2D imageTexture;


void main(){

  // vec2 newImageTexture = vPosition.xy/vec2(640. * 1.5 , 960. * 1.5) + vec2(0.5);


  vec4 imageTextureColor = texture2D(imageTexture, vUv);

  gl_FragColor = vec4(1., 0., 0., 1.);
  gl_FragColor = vec4(vUv, 0., 1.);
  gl_FragColor = imageTextureColor;

  if(gl_FragColor.r < 0.1 && gl_FragColor.g < 0.1 && gl_FragColor.b < 0.1){
    discard;
  }
}