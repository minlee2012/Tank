 /**
 * Min Lee
 * Jami Montgomery
 * COSC-275 Computer Graphics
 */
// Main function
// Runs in Browser

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    /* Shaders are the GPU processors
     *  Vertex Shader processes vertices
     *
     *  Fragment Shader processes texels (pixels), determine color
     */
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Write the positions of vertices to a vertex shader
    /*
     * Create Vertex Data and store it on the graphics card GPU
     */
    var n = initCubeBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the cube vertices');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0.5, 1, 1);

    // Get the storage locations of u_ModelMatrix, u_ViewMatrix, and u_ProjMatrix
    var u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
    if (!u_mvpMatrix) {
        console.log('Failed to Get the storage locations of u_mvpMatrix');
        return;
    }

    //initialize model, view, and projection matrices
    //combined view and projection as one matrix from the beginning
    //mvp will be the final one that houses all three to be sent down to the vertex shader (for efficiency)
    //var modelMatrix = new Matrix4(); // The model matrix
    var hullModelMatrix = new Matrix4();
    var turretModelMatrix = new Matrix4();
    var muzzleModelMatrix = new Matrix4();
    var wheelModelMatrix = new Matrix4();
    var vpMatrix = new Matrix4(); //The view * projection matrix
    var mvpMatrix = new Matrix4();    // Model view projection matrix

    vpMatrix.setPerspective(40, 1, 1, 100);
    vpMatrix.lookAt(3, 1, 7, 0, 0, 0, 0, 1, 0);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //Depth testing
    gl.enable(gl.DEPTH_TEST);

    // Register the event handler to be called on key press
    document.onkeydown = function(ev){ keydown(ev, gl, n, hullModelMatrix, turretModelMatrix, muzzleModelMatrix, wheelModelMatrix, vpMatrix, mvpMatrix, u_mvpMatrix); };

    //draw(gl, n, modelMatrix, vpMatrix, mvpMatrix, u_mvpMatrix);
    Tank(hullModelMatrix, turretModelMatrix, muzzleModelMatrix, wheelModelMatrix, vpMatrix, mvpMatrix, u_mvpMatrix, n, gl);

}

function initCubeBuffers(gl) {

    var cubeVertices = new Float32Array([
        //Front face
        0.5,  0.25,  0.5,
        -0.5,  0.25,  0.5,
        -0.5, -0.25,  0.5,

        -0.5, -0.25,  0.5,
        0.5, -0.25,  0.5,
        0.5,  0.25,  0.5,

        //Top face
        0.5,  0.25,  0.5,
        0.5,  0.25, -0.5,
        -0.5,  0.25, -0.5,

        -0.5,  0.25, -0.5,
        -0.5,  0.25,  0.5,
        0.5,  0.25,  0.5,

        //Right face
        0.5,  0.25,  0.5,
        0.5,  0.25, -0.5,
        0.5, -0.25, -0.5,

        0.5, -0.25, -0.5,
        0.5, -0.25,  0.5,
        0.5,  0.25,  0.5,

        //Left face
        -0.5,  0.25,  0.5,
        -0.5,  0.25, -0.5,
        -0.5, -0.25, -0.5,

        -0.5, -0.25, -0.5,
        -0.5, -0.25,  0.5,
        -0.5,  0.25,  0.5,

        //Bottom face
        0.5,  -0.25,  0.5,
        0.5,  -0.25, -0.5,
        -0.5,  -0.25, -0.5,

        -0.5, -0.25, -0.5,
        -0.5,  -0.25,  0.5,
        0.5,  -0.25,  0.5,

        //Back face
        0.5,  0.25,  -0.5,
        -0.5,  0.25,  -0.5,
        -0.5, -0.25,  -0.5,

        -0.5, -0.25,  -0.5,
        0.5, -0.25,  -0.5,
        0.5,  0.25,  -0.5,

    ]);

    var n = 36; // The number of vertices

    // Create a buffer object
    var cubeVertexBuffer = gl.createBuffer();
    if (!cubeVertexBuffer) {
        console.log('Failed to create the buffer object for vertices');
        return -1;
    }

    // Bind the vertex buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var cubeColors = new Float32Array([
        //Front face
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        //Top face
        0.3, 0.15, 0.3, 1.0,
        0.3, 0.15, 0.3, 1.0,
        0.3, 0.15, 0.3, 1.0,
        0.3, 0.15, 0.3, 1.0,
        0.3, 0.15, 0.3, 1.0,
        0.3, 0.15, 0.3, 1.0,
        //Right face
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        //Left face
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        //Bottom face
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        //Back face
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
    ]);

    var cubeColorBuffer = gl.createBuffer();
    if (!cubeColorBuffer) {
        console.log('Failed to create the buffer object for color');
        return -1;
    }

    // Bind the color buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    // Assign the buffer object to a_Color variable
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function initWheelBuffers(gl) {

    var wheelVertices = new Float32Array([
       
       //Front face 12-3
       0.0, 0.2, 0.6,
       0.025, 0.198, 0.6,
       0.0, 0.0, 0.6,

       0.025, 0.198, 0.6,
       0.05, 0.194, 0.6,
       0.0, 0.0, 0.6,

       0.05, 0.194, 0.6,
       0.075, 0.186, 0.6,
       0.0, 0.0, 0.6,

       0.075, 0.185, 0.6,
       0.1, 0.173, 0.6,
       0.0, 0.0, 0.6,

       0.1, 0.173, 0.6,
       0.125, 0.156, 0.6,
       0.0, 0.0, 0.6,

       0.125, 0.156, 0.6,
       0.15, 0.132, 0.6,
       0.0, 0.0, 0.6,

       0.15, 0.132, 0.6,
       0.175, 0.097, 0.6,
       0.0, 0.0, 0.6,

       0.175, 0.097, 0.6,
       0.2, 0.0, 0.6,
       0.0, 0.0, 0.6,

       //Front face 3-6
       0.2, 0.0, 0.6,
       0.175, -0.097, 0.6,
       0.0, 0.0, 0.6,

       0.175, -0.097, 0.6,
       0.15, -0.132, 0.6,
       0.0, 0.0, 0.6,

       0.15, -0.132, 0.6,
       0.125, -0.156, 0.6,
       0.0, 0.0, 0.6,

       0.125, -0.156, 0.6,
       0.1, -0.173, 0.6,
       0.0, 0.0, 0.6,

       0.1, -0.173, 0.6,
       0.075, -0.185, 0.6,
       0.0, 0.0, 0.6,

       0.075, -0.185, 0.6,
       0.05, -0.194, 0.6,
       0.0, 0.0, 0.6,

       0.05, -0.194, 0.6,
       0.025, -0.198, 0.6,
       0.0, 0.0, 0.6,

       0.025, -0.198, 0.6,
       0.0, -0.2, 0.6,
       0.0, 0.0, 0.6,

       //Front face 6-9
       0.0, -0.2, 0.6,
       -0.025, -0.198, 0.6,
       0.0, 0.0, 0.6,

       -0.025, -0.198, 0.6,
       -0.05, -0.194, 0.6,
       0.0, 0.0, 0.6,

       -0.05, -0.194, 0.6,
       -0.075, -0.185, 0.6,
       0.0, 0.0, 0.6,

       -0.075, -0.185, 0.6,
       -0.1, -0.173, 0.6,
       0.0, 0.0, 0.6,

       -0.1, -0.173, 0.6,
       -0.125, -0.156, 0.6,
       0.0, 0.0, 0.6,

       -0.125, -0.156, 0.6,
       -0.15, -0.132, 0.6,
       0.0, 0.0, 0.6,

       -0.15, -0.132, 0.6,
       -0.175, -0.097, 0.6,
       0.0, 0.0, 0.6,

       -0.175, -0.097, 0.6,
       -0.2, 0.0, 0.6,
       0.0, 0.0, 0.6,

       //Front face 9-12
       -0.2, 0.0, 0.6,
       -0.175, 0.097, 0.6,
       0.0, 0.0, 0.6,

       -0.175, 0.097, 0.6,
       -0.15, 0.132, 0.6,
       0.0, 0.0, 0.6,

       -0.15, 0.132, 0.6,
       -0.125, 0.156, 0.6,
       0.0, 0.0, 0.6,

       -0.125, 0.156, 0.6,
       -0.1, 0.173, 0.6,
       0.0, 0.0, 0.6,

       -0.1, 0.173, 0.6,
       -0.075, 0.185, 0.6,
       0.0, 0.0, 0.6,

       -0.075, 0.185, 0.6,
       -0.05, 0.194, 0.6,
       0.0, 0.0, 0.6,

       -0.05, 0.194, 0.6,
       -0.025, 0.198, 0.6,
       0.0, 0.0, 0.6,

       -0.025, 0.198, 0.6,
       -0.0, 0.2, 0.6,
       0.0, 0.0, 0.6,

       //Back face 12-3
       0.0, 0.2, 0.5,
       0.025, 0.198, 0.5,
       0.0, 0.0, 0.5,

       0.025, 0.198, 0.5,
       0.05, 0.194, 0.5,
       0.0, 0.0, 0.5,

       0.05, 0.194, 0.5,
       0.075, 0.186, 0.5,
       0.0, 0.0, 0.5,

       0.075, 0.185, 0.5,
       0.1, 0.173, 0.5,
       0.0, 0.0, 0.5,

       0.1, 0.173, 0.5,
       0.125, 0.156, 0.5,
       0.0, 0.0, 0.5,

       0.125, 0.156, 0.5,
       0.15, 0.132, 0.5,
       0.0, 0.0, 0.5,

       0.15, 0.132, 0.5,
       0.175, 0.097, 0.5,
       0.0, 0.0, 0.5,

       0.175, 0.097, 0.5,
       0.2, 0.0, 0.5,
       0.0, 0.0, 0.5,

       //Back face 3-6
       0.2, 0.0, 0.5,
       0.175, -0.097, 0.5,
       0.0, 0.0, 0.5,

       0.175, -0.097, 0.5,
       0.15, -0.132, 0.5,
       0.0, 0.0, 0.5,

       0.15, -0.132, 0.5,
       0.125, -0.156, 0.5,
       0.0, 0.0, 0.5,

       0.125, -0.156, 0.5,
       0.1, -0.173, 0.5,
       0.0, 0.0, 0.5,

       0.1, -0.173, 0.5,
       0.075, -0.185, 0.5,
       0.0, 0.0, 0.5,

       0.075, -0.185, 0.5,
       0.05, -0.194, 0.5,
       0.0, 0.0, 0.5,

       0.05, -0.194, 0.5,
       0.025, -0.198, 0.5,
       0.0, 0.0, 0.5,

       0.025, -0.198, 0.5,
       0.0, -0.2, 0.5,
       0.0, 0.0, 0.5,

       //Back face 6-9
       0.0, -0.2, 0.5,
       -0.025, -0.198, 0.5,
       0.0, 0.0, 0.5,

       -0.025, -0.198, 0.5,
       -0.05, -0.194, 0.5,
       0.0, 0.0, 0.5,

       -0.05, -0.194, 0.5,
       -0.075, -0.185, 0.5,
       0.0, 0.0, 0.5,

       -0.075, -0.185, 0.5,
       -0.1, -0.173, 0.5,
       0.0, 0.0, 0.5,

       -0.1, -0.173, 0.5,
       -0.125, -0.156, 0.5,
       0.0, 0.0, 0.5,

       -0.125, -0.156, 0.5,
       -0.15, -0.132, 0.5,
       0.0, 0.0, 0.5,

       -0.15, -0.132, 0.5,
       -0.175, -0.097, 0.5,
       0.0, 0.0, 0.5,

       -0.175, -0.097, 0.5,
       -0.2, 0.0, 0.5,
       0.0, 0.0, 0.5,

       //Back face 9-12
       -0.2, 0.0, 0.5,
       -0.175, 0.097, 0.5,
       0.0, 0.0, 0.5,

       -0.175, 0.097, 0.5,
       -0.15, 0.132, 0.5,
       0.0, 0.0, 0.5,

       -0.15, 0.132, 0.5,
       -0.125, 0.156, 0.5,
       0.0, 0.0, 0.5,

       -0.125, 0.156, 0.5,
       -0.1, 0.173, 0.5,
       0.0, 0.0, 0.5,

       -0.1, 0.173, 0.5,
       -0.075, 0.185, 0.5,
       0.0, 0.0, 0.5,

       -0.075, 0.185, 0.5,
       -0.05, 0.194, 0.5,
       0.0, 0.0, 0.5,

       -0.05, 0.194, 0.5,
       -0.025, 0.198, 0.5,
       0.0, 0.0, 0.5,

       -0.025, 0.198, 0.5,
       -0.0, 0.2, 0.5,
       0.0, 0.0, 0.5,

       //Edge Faces 12-3
       0.025, 0.198, 0.6,
       0.0, 0.2, 0.6,
       0.0, 0.2, 0.5,

       0.0, 0.2, 0.5,
       0.025, 0.198, 0.5,
       0.025, 0.198, 0.6,

       0.05, 0.194, 0.6,
       0.025, 0.198, 0.6,
       0.025, 0.198, 0.5,

       0.025, 0.198, 0.5,
       0.05, 0.194, 0.5,
       0.05, 0.194, 0.6,

       0.075, 0.185, 0.6,
       0.05, 0.194, 0.6,
       0.05, 0.194, 0.5,

       0.05, 0.194, 0.5,
       0.075, 0.185, 0.5,
       0.075, 0.185, 0.6,

       0.1, 0.173, 0.6,
       0.075, 0.185, 0.6,
       0.075, 0.185, 0.5,

       0.075, 0.185, 0.5,
       0.1, 0.173, 0.5,
       0.1, 0.173, 0.6,

       0.125, 0.156, 0.6,
       0.1, 0.173, 0.6,
       0.1, 0.173, 0.5,

       0.1, 0.173, 0.5,
       0.125, 0.156, 0.5,
       0.125, 0.156, 0.6,

       0.15, 0.132, 0.6,
       0.125, 0.156, 0.6,
       0.125, 0.156, 0.5,

       0.125, 0.156, 0.5,
       0.15, 0.132, 0.5,
       0.15, 0.132, 0.6,

       0.175, 0.097, 0.6,
       0.15, 0.132, 0.6,
       0.15, 0.132, 0.5,

       0.15, 0.132, 0.5,
       0.175, 0.097, 0.5,
       0.175, 0.097, 0.6,

       0.2, 0.0, 0.6,
       0.175, 0.097, 0.6,
       0.175, 0.097, 0.5,

       0.175, 0.097, 0.5,
       0.2, 0.0, 0.5,
       0.2, 0.0, 0.6,

       //Edge Faces 3-6
       0.025, -0.198, 0.6,
       0.0, -0.2, 0.6,
       0.0, -0.2, 0.5,

       0.0, -0.2, 0.5,
       0.025, -0.198, 0.5,
       0.025, -0.198, 0.6,

       0.05, -0.194, 0.6,
       0.025, -0.198, 0.6,
       0.025, -0.198, 0.5,

       0.025, -0.198, 0.5,
       0.05, -0.194, 0.5,
       0.05, -0.194, 0.6,

       0.075, -0.185, 0.6,
       0.05, -0.194, 0.6,
       0.05, -0.194, 0.5,

       0.05, -0.194, 0.5,
       0.075, -0.185, 0.5,
       0.075, -0.185, 0.6,

       0.1, -0.173, 0.6,
       0.075, -0.185, 0.6,
       0.075, -0.185, 0.5,

       0.075, -0.185, 0.5,
       0.1, -0.173, 0.5,
       0.1, -0.173, 0.6,

       0.125, -0.156, 0.6,
       0.1, -0.173, 0.6,
       0.1, -0.173, 0.5,

       0.1, -0.173, 0.5,
       0.125, -0.156, 0.5,
       0.125, -0.156, 0.6,

       0.15, -0.132, 0.6,
       0.125, -0.156, 0.6,
       0.125, -0.156, 0.5,

       0.125, -0.156, 0.5,
       0.15, -0.132, 0.5,
       0.15, -0.132, 0.6,

       0.175, -0.097, 0.6,
       0.15, -0.132, 0.6,
       0.15, -0.132, 0.5,

       0.15, -0.132, 0.5,
       0.175, -0.097, 0.5,
       0.175, -0.097, 0.6,

       0.2, 0.0, 0.6,
       0.175, -0.097, 0.6,
       0.175, -0.097, 0.5,

       0.175, -0.097, 0.5,
       0.2, 0.0, 0.5,
       0.2, 0.0, 0.6,

       //Edge Faces 6-9
       -0.025, -0.198, 0.6,
       0.0, -0.2, 0.6,
       0.0, -0.2, 0.5,

       0.0, -0.2, 0.5,
       -0.025, -0.198, 0.5,
       -0.025, -0.198, 0.6,

       -0.05, -0.194, 0.6,
       -0.025, -0.198, 0.6,
       -0.025, -0.198, 0.5,

       -0.025, -0.198, 0.5,
       -0.05, -0.194, 0.5,
       -0.05, -0.194, 0.6,

       -0.075, -0.185, 0.6,
       -0.05, -0.194, 0.6,
       -0.05, -0.194, 0.5,

       -0.05, -0.194, 0.5,
       -0.075, -0.185, 0.5,
       -0.075, -0.185, 0.6,

       -0.1, -0.173, 0.6,
       -0.075, -0.185, 0.6,
       -0.075, -0.185, 0.5,

       -0.075, -0.185, 0.5,
       -0.1, -0.173, 0.5,
       -0.1, -0.173, 0.6,

       -0.125, -0.156, 0.6,
       -0.1, -0.173, 0.6,
       -0.1, -0.173, 0.5,

       -0.1, -0.173, 0.5,
       -0.125, -0.156, 0.5,
       -0.125, -0.156, 0.6,

       -0.15, -0.132, 0.6,
       -0.125, -0.156, 0.6,
       -0.125, -0.156, 0.5,

       -0.125, -0.156, 0.5,
       -0.15, -0.132, 0.5,
       -0.15, -0.132, 0.6,

       -0.175, -0.097, 0.6,
       -0.15, -0.132, 0.6,
       -0.15, -0.132, 0.5,

       -0.15, -0.132, 0.5,
       -0.175, -0.097, 0.5,
       -0.175, -0.097, 0.6,

       -0.2, 0.0, 0.6,
       -0.175, -0.097, 0.6,
       -0.175, -0.097, 0.5,

       -0.175, -0.097, 0.5,
       -0.2, 0.0, 0.5,
       -0.2, 0.0, 0.6,

       //Edge Faces 9-12
       -0.025, 0.198, 0.6,
       0.0, 0.2, 0.6,
       0.0, 0.2, 0.5,

       0.0, 0.2, 0.5,
       -0.025, 0.198, 0.5,
       -0.025, 0.198, 0.6,

       -0.05, 0.194, 0.6,
       -0.025, 0.198, 0.6,
       -0.025, 0.198, 0.5,

       -0.025, 0.198, 0.5,
       -0.05, 0.194, 0.5,
       -0.05, 0.194, 0.6,

       -0.075, 0.185, 0.6,
       -0.05, 0.194, 0.6,
       -0.05, 0.194, 0.5,

       -0.05, 0.194, 0.5,
       -0.075, 0.185, 0.5,
       -0.075, 0.185, 0.6,

       -0.1, 0.173, 0.6,
       -0.075, 0.185, 0.6,
       -0.075, 0.185, 0.5,

       -0.075, 0.185, 0.5,
       -0.1, 0.173, 0.5,
       -0.1, 0.173, 0.6,

       -0.125, 0.156, 0.6,
       -0.1, 0.173, 0.6,
       -0.1, 0.173, 0.5,

       -0.1, 0.173, 0.5,
       -0.125, 0.156, 0.5,
       -0.125, 0.156, 0.6,

       -0.15, 0.132, 0.6,
       -0.125, 0.156, 0.6,
       -0.125, 0.156, 0.5,

       -0.125, 0.156, 0.5,
       -0.15, 0.132, 0.5,
       -0.15, 0.132, 0.6,

       -0.175, 0.097, 0.6,
       -0.15, 0.132, 0.6,
       -0.15, 0.132, 0.5,

       -0.15, 0.132, 0.5,
       -0.175, 0.097, 0.5,
       -0.175, 0.097, 0.6,

       -0.2, 0.0, 0.6,
       -0.175, 0.097, 0.6,
       -0.175, 0.097, 0.5,

       -0.175, 0.097, 0.5,
       -0.2, 0.0, 0.5,
       -0.2, 0.0, 0.6,

    ]);

    var n = 384; // The number of vertices

    // Create a buffer object
    var wheelVertexBuffer = gl.createBuffer();
    if (!wheelVertexBuffer) {
        console.log('Failed to create the buffer object for vertices');
        return -1;
    }

    // Bind the vertex buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, wheelVertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, wheelVertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var wheelColors = new Float32Array([
        
        //Front face 12-3
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        //Front face 3-6 
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        //Front face 6-9
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        //Front face 9-12
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.0, 0.0, 0.0, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,
        0.3, 0.75, 0.3, 1.0,

        //Back face 12-3
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        //Back face 3-6 
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        //Back face 6-9
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        //Back face 9-12
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,
        1.3, 0.75, 0.3, 1.0,

        //Edge Faces 12-3
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        //Edge Faces 3-6
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        //Edge Faces 6-9
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,
        0.3, 0.0, 0.3, 1.0,

        //Edge Faces 9-12
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,
        0.3, 0.7, 0.3, 1.0,

    ]);

    var wheelColorBuffer = gl.createBuffer();
    if (!wheelColorBuffer) {
        console.log('Failed to create the buffer object for color');
        return -1;
    }

    // Bind the color buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, wheelColorBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, wheelColors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    // Assign the buffer object to a_Color variable
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function Tank(hull, turret, muzzle, wheel, vpMatrix, mvpMatrix, u_mvpMatrix, n, gl){
    this.hull = hull;
    this.turret = turret;
    this.muzzle = muzzle;

    gl.clear(gl.COLOR_BUFFER_BIT);

    //HULL
    hull.setRotate(Rx, 0, 1, 0);
    hull.scale(0.8, 0.7, 1.6);
    hull.translate(0, 0, (0+Tz));
    mvpMatrix.set(vpMatrix).multiply(hull);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    //TURRET
    turret.setRotate(Rx, 0, 1, 0);
    turret.translate(0, 0.3, (0+(Tz*1.6)));
    turret.scale(0.5, 0.5, 0.5);
    turret.rotate(Rx2, 0, 1, 0);
    mvpMatrix.set(vpMatrix).multiply(turret);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    //MUZZLE
    muzzle.setRotate(Rx, 0, 1, 0);
    muzzle.rotate(Rx2, 0, 1, 0);
    muzzle.translate(0, 0.3, (0.5+(Tz*1.6)));
    muzzle.scale(0.125, 0.25, 0.75);
    muzzle.rotate(Ry, 1, 0, 0);
    mvpMatrix.set(vpMatrix).multiply(muzzle);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    
    var m = initWheelBuffers(gl);
    if (m < 0) {
        console.log('Failed to set the positions of the wheel vertices');
        return;
    }

    wheel.setRotate((90 + Rx), 0, 1, 0);
    wheel.translate((0.5 - (Tz * 1.6)), -0.1, -0.1);
    wheel.rotate(Wx, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(wheel);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, m);

    wheel.rotate(-Wx, 0, 0, 1);
    wheel.translate(-1, 0, 0);
    wheel.rotate(Wx, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(wheel);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, m);

    wheel.rotate(-Wx, 0, 0, 1);
    wheel.rotate(180, 0, 1, 0);
    wheel.translate(0.1, 0, -0.2);
    wheel.rotate(-Wx, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(wheel);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, m);

    wheel.rotate(Wx, 0, 0, 1);
    wheel.translate(-1.2, 0, 0);
    wheel.rotate(-Wx, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(wheel);
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, m);

    var n = initCubeBuffers(gl);

};//Tank constructor

var Tz = 0;
var Rx = 0;
var Ry = 0;
var Rx2 = 0;
var Wx = 0;
function keydown(ev, gl, n, hullModelMatrix, turretModelMatrix, muzzleModelMatrix, wheelModelMatrix, vpMatrix, mvpMatrix, u_mvpMatrix) {
    if(ev.keyCode == 39) { // Right
        Rx2 -= 1;
    } else 
    if (ev.keyCode == 37) { // Left
        Rx2 += 1;
    } else
    if(ev.keyCode == 38) { // Up
        if(Ry >= -90){
            Ry -= 1;
        }//set a boundary
    } else 
    if (ev.keyCode == 40) { // Down
        if(Ry <= -1){
            Ry += 1;
        }//set a boundary
    } else
    if(ev.keyCode == 87) { // W
        if(Tz <= 7){
            Tz += 0.01;
            Wx += 45;
        }//set a boundary
    } else 
    if (ev.keyCode == 65) { // A
      Rx += 1;
    } else
    if(ev.keyCode == 83) { // S
        if(Tz >= -7){
            Tz -= 0.01;
            Wx -= 45;
        }//set a boundary
    } else 
    if (ev.keyCode == 68) { // D
      Rx -= 1;
    }
    else { 
        return;
    }
    Tank(hullModelMatrix, turretModelMatrix, muzzleModelMatrix, wheelModelMatrix, vpMatrix, mvpMatrix, u_mvpMatrix, n, gl);
}//keydown

// Shaders
// Vertex and Fragment
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_mvpMatrix;\n' +
  'varying lowp vec4 vColors;\n' +
  'void main() {\n' +
  '  vColors = a_Color;\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
'}\n';

// Fragment shader program
//
var FSHADER_SOURCE =
  'varying lowp vec4 vColors;\n' +
  'precision mediump float;\n' +
  'void main() {\n' +
  '  gl_FragColor = vColors;\n' +
  '}\n';
