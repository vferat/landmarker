// Update code
function updateCode() {
    const codeBlock = document.getElementById('codeBlock');
    const code = codeBlock.querySelector('code');
    var nodes = nv1.meshes[0].connectome.nodes;
    console.log(nodes);
    var codeText = '"AnatomicalLandmarkCoordinates": {\n';
    for (var i = 0; i < nodes.length; i++) {
      var mm_pos = [nodes[i].x, nodes[i].y, nodes[i].z];
      var frac_pos = nv1.volumes[0].convertMM2Frac(mm_pos);
      var precise_voxel_pos = precise_frac2vox(frac_pos, nv1.volumes[0]);
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
    var voxel_pos = nv1.frac2vox(frac_pos);
    var precise_voxel_pos = precise_frac2vox(frac_pos, nv1.volumes[0]);
    var mm_pos = nv1.volumes[0].convertFrac2MM(frac_pos, true);
    console.log(`crosshairpos`, frac_pos);
    console.log(`${fiducial_name} mm position`, mm_pos);
    console.log(`${fiducial_name} voxel position`, voxel_pos);
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

  // Utility function to calculate precise fractional position
  function precise_frac2vox(frac, image) {
    var pos = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      pos[i] = frac[i] * image.dims[i+1];
    }
    return pos;
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
