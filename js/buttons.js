// Get the button and file input elements
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');

// Click event for the button
uploadBtn.addEventListener('click', () => {
  fileInput.click();  // Simulate click on hidden file input
});

// When files are selected
fileInput.addEventListener('change', async (event) => {
    console.log(event.target);
    const file = event.target.files[0];

    // Variables to store the NIfTI and JSON file
    let niiFile = null;

    // Check the extensions of the selected files
    const ext = file.name.split('.').pop().toLowerCase();

    // Handle nii and nii.gz files
    if (ext === 'nii' || (ext === 'gz' && file.name.endsWith('.nii.gz'))) {
        niiFile = file;
    } else {
        console.error('Invalid file type');
        return;
    }
    // Load the volume into Niivue
    if (nv1.meshes.length > 0){
        nv1.removeMesh(nv1.meshes[0]);
    }
    nv1.removeVolume(nv1.volumes[0]);
    await nv1.loadFromFile(niiFile);
});