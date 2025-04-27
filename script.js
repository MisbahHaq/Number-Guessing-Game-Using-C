// Start background confetti
const backgroundCanvas = document.getElementById('backgroundConfetti');
const backgroundConfetti = confetti.create(backgroundCanvas, { resize: true, useWorker: true });

setInterval(() => {
  backgroundConfetti({
    particleCount: 2,
    spread: 80,
    startVelocity: 20,
    decay: 0.9,
    colors: ['#bb0000', '#ffffff', '#00bb00'],
    origin: {
      x: Math.random(),
      y: Math.random() - 0.2
    }
  });
}, 400);

// Handling resume upload and analysis
let resumeText = "";

function analyzeResume() {
  const fileInput = document.getElementById('resumeUpload');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a file first!");
    return;
  }

  const type = file.name.split('.').pop().toLowerCase();
  if (type === 'txt') {
    const reader = new FileReader();
    reader.onload = e => {
      resumeText = e.target.result;
      performAnalysis();
    };
    reader.readAsText(file);
  } else if (type === 'pdf') {
    const reader = new FileReader();
    reader.onload = e => {
      const typedArray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
        pdf.getPage(1).then(page => {
          page.getTextContent().then(textContent => {
            resumeText = textContent.items.map(item => item.str).join(" ");
            performAnalysis();
          });
        });
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Only .txt or .pdf files are allowed.");
  }
}

function performAnalysis() {
  document.getElementById('progressContainer').classList.remove('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').innerText = "Analyzing...";

  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 100) {
      progress += 10;
      document.getElementById('progressFill').style.width = progress + '%';
    } else {
      clearInterval(progressInterval);
      showResults();
    }
  }, 500);
}

function showResults() {
  document.getElementById('progressContainer').classList.add('hidden');
  document.getElementById('resultContainer').classList.remove('hidden');
  
  // Generate the score and limit it to two decimal points
  const score = (Math.random() * 100).toFixed(2);
  document.getElementById('score').innerText = `Score: ${score}`;

  const tips = document.getElementById('tips');
  tips.innerHTML = "<ul><li>Consider using more action verbs.</li><li>Include specific accomplishments.</li></ul>";

  // Show success animation
  document.getElementById('successAnimation').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('successAnimation').classList.add('hidden');
  }, 2000);
}

// File upload handling
const fileInput = document.getElementById('resumeUpload');
const uploadLabel = document.getElementById('uploadLabel');
const uploadText = document.getElementById('uploadText');

// When a file is selected
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadText.innerText = file.name;  // Display the file name
    uploadLabel.classList.add('file-selected');  // Optional: Add a class for styling (e.g., change background color)
  }
});

// Drag and Drop handling
uploadLabel.addEventListener('dragover', (event) => {
  event.preventDefault(); // Allow drop
  uploadLabel.classList.add('drag-over'); // Optional: Change style when dragging over
});

uploadLabel.addEventListener('dragleave', () => {
  uploadLabel.classList.remove('drag-over'); // Reset style when drag leaves
});

uploadLabel.addEventListener('drop', (event) => {
  event.preventDefault(); // Prevent default behavior (e.g., opening the file)
  const file = event.dataTransfer.files[0];
  if (file) {
    fileInput.files = event.dataTransfer.files; // Programmatically set the file input
    uploadText.innerText = file.name; // Display the file name
    uploadLabel.classList.add('file-selected'); // Optional: Add a class for styling
  }
});
