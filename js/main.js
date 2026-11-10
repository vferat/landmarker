// Update code
function updateCode() {
    const codeBlock = document.getElementById('codeBlock');
    const code = codeBlock.querySelector('code');
    var nodes = nv1.meshes[0].connectome.nodes;
    console.log(nodes);
    var codeText = '"AnatomicalLandmarkCoordinates": {\n';
    for (var i = 0; i < nodes.length; i++) {
      var mm_pos = [nodes[i].x, nodes[i].y, nodes[i].z];
      var precise_voxel_pos = mm2nativeVox(mm_pos, nv1.volumes[0]);
      codeText += `\t\t\t\t "${nodes[i].name}":` + '[' + precise_voxel_pos + ']' + ',' + '\n'
    }
    codeText = codeText.slice(0, -2);
    codeText += '}';
    code.textContent = codeText;
  }

  // Define the function first before it's referenced in the button click events
  function onclickFiducial(fiducial_name) {
    if (nv1.meshes.length == 0) {
        addFiducialsConnectome();
    }
    let node_idx;
    if (fiducial_name == "NAS") {
      node_idx = 0;
    } else if (fiducial_name == "LPA") {
      node_idx = 1;
    } else if (fiducial_name == "RPA") {
      node_idx = 2;
    }
    var frac_pos = nv1.scene.crosshairPos;
    var mm_pos = nv1.volumes[0].convertFrac2MM(frac_pos, true);
    var precise_voxel_pos = mm2nativeVox(mm_pos, nv1.volumes[0]);
    console.log(`crosshairpos`, frac_pos);
    console.log(`${fiducial_name} mm position`, mm_pos);
    console.log(`${fiducial_name} precise voxel position`, precise_voxel_pos);

    let node = {
      name: fiducial_name,
      x: mm_pos[0],
      y: mm_pos[1],
      z: mm_pos[2],
      colorValue: node_idx + 1,
      sizeValue: 2,
    }
    nv1.meshes[0].updateConnectomeNodeByIndex(node_idx, node);
    nv1.meshes[0].updateMesh(nv1.gl);
    nv1.updateGLVolume();
    nv1.drawScene();
    updateCode();
  }

  // Convert world (scanner RAS, mm) coordinates to voxel indices of the file
  // as stored on disk. NiiVue internally reorients volumes to RAS, so its
  // fractional/voxel coordinates only match the file for RAS-oriented images;
  // use the header affine directly instead.
  function mm2nativeVox(mm, image) {
    var A = image.hdr.affine; // 4x4, rows, voxel -> mm
    var a = A[0][0], b = A[0][1], c = A[0][2];
    var d = A[1][0], e = A[1][1], f = A[1][2];
    var g = A[2][0], h = A[2][1], k = A[2][2];
    var x = mm[0] - A[0][3], y = mm[1] - A[1][3], z = mm[2] - A[2][3];
    var det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
    return [
      ((e * k - f * h) * x + (c * h - b * k) * y + (b * f - c * e) * z) / det,
      ((f * g - d * k) * x + (a * k - c * g) * y + (c * d - a * f) * z) / det,
      ((d * h - e * g) * x + (b * g - a * h) * y + (a * e - b * d) * z) / det,
    ];
  }

  function addFiducialsConnectome() {
    let connectome = {
      name: "fiducials",
      nodeColormap: "roi_i256",
      nodeColormapNegative: "winter",
      nodeMinColor: 1,
      nodeMaxColor: 5,
      nodeScale: 3, // scale factor for node, e.g. if 2 and a node has size 3, a 6mm ball is drawn
      edgeColormap: "warm",
      edgeColormapNegative: "winter",
      edgeMin: 2,
      edgeMax: 6,
      nodes: [
        {
          name: "NAS",
          x: 0,
          y: 0,
          z: 0,
          colorValue: 1,
          sizeValue: 2,
        },
        {
          name: "LPA",
          x: 0,
          y: 0,
          z: 0,
          colorValue: 2,
          sizeValue: 2,
        },
        {
          name: "RPA",
          x: 0,
          y: 0,
          z: 0,
          colorValue: 4,
          sizeValue: 2,
        },
      ],
      edges: [],
    }; // connectome{}
    nv1.loadConnectome(connectome);
    nv1.meshes[0].updateMesh(nv1.gl);
    nv1.updateGLVolume();
    nv1.drawScene();
  }
  // Add event listeners for the buttons
  document.getElementById("nasBtn").addEventListener("click", function() {
    onclickFiducial("NAS");
  });

  document.getElementById("lpaBtn").addEventListener("click", function() {
    onclickFiducial("LPA");
  });

  document.getElementById("rpaBtn").addEventListener("click", function() {
    onclickFiducial("RPA");
  });

  // Init
  let defaults = {
    loadingText: "there are no images",
    backColor: [0, 0, 0, 1],
    legendBackgroundColor: [0, 0, 0, 1],
    isResizeCanvas: true,
    show3Dcrosshair: true,
    dragAndDropEnabled: false,
  };
  var nv1 = new niivue.Niivue(defaults);
  window.nv1 = nv1;
  nv1.attachTo("niivueCanvas");
  nv1.setSliceType(nv1.sliceTypeMultiplanar);
  nv1.setSliceMM(false);
  nv1.opts.multiplanarForceRender = true;
  
  // Load default image
  nv1.onImageLoaded = (volume) => {
    console.log('onImageLoaded');
    addFiducialsConnectome();
    updateCode();
  };

  nv1.loadVolumes([{"url": "assets/susan_mri.nii.gz"}]);
