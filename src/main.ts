// main.ts
import './style.css';

const mainElement = document.querySelector<HTMLDivElement>('#app')!;

// example HTTP request: curl -X POST -H "Content-Type: application/json" -d "{\"action\": \"edit\", \"team_number\": 5951, \"coordinates\": [[1000, 550], [350, 675], [300, 700]]}" https://MA5951.pythonanywhere.com/update_image

mainElement.innerHTML = `
  <div>
    <h1>Team Page</h1>
    <label for="teamNumber">Enter Team Number:</label>
    <input type="number" id="teamNumber" />
    <div id="imageContainer" class="card" style="position: relative; width: 70vw; overflow: hidden;">
      <canvas id="teamCanvas" style="width: 100%; height: auto; position: relative;"></canvas>
    </div>
    <button id="sendButton">Send</button>
    <p id="httpRequestText" style="margin-top: 10px;"></p>
    <p id="errorText" style="color: red;"></p>
  </div>
`;

const teamNumberInput = document.querySelector<HTMLInputElement>('#teamNumber')!;
const imageContainer = document.querySelector<HTMLDivElement>('#imageContainer')!;
const teamCanvas = document.querySelector<HTMLCanvasElement>('#teamCanvas')!;
const sendButton = document.querySelector<HTMLButtonElement>('#sendButton')!;
const httpRequestText = document.querySelector<HTMLParagraphElement>('#httpRequestText')!;
const errorText = document.querySelector<HTMLParagraphElement>('#errorText')!;
const ctx = teamCanvas.getContext('2d')!;

let coordinates: { x: number; y: number }[] = [];

// Function to handle canvas click and add green dot
const handleCanvasClick = (event: MouseEvent) => {
  const boundingBox = teamCanvas.getBoundingClientRect();
  const x = (event.clientX - boundingBox.left) * (teamCanvas.width / teamCanvas.clientWidth);
  const y = (event.clientY - boundingBox.top) * (teamCanvas.height / teamCanvas.clientHeight);

  // Draw a green dot on the canvas
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'green';
  ctx.fill();

  // Save the coordinates
  coordinates.push({ x, y });
};

// Attach click event listener to the canvas
teamCanvas.addEventListener('click', handleCanvasClick);

// Function to send HTTP request
const sendRequest = async () => {
  const teamNumber = parseInt(teamNumberInput.value, 10);

  // Check if there are coordinates and a team number
  if (coordinates.length === 0 || isNaN(teamNumber)) {
    errorText.textContent = 'Please enter a valid team number and add at least one point.';
    return;
  }

  try {
    console.log('Sending request...');
    const requestBody = {
      action: 'edit',
      team_number: teamNumber,
      coordinates: coordinates.map(({ x, y }) => [x, y]),
    };

    // const requestBody = {"action": "edit", "team_number": 5951, "coordinates": [[10, 10], [2000, 10], [1500, 50]]}

    console.log('Request Body:', requestBody);

    const response = await fetch('https://MA5951.pythonanywhere.com/update_image', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response:', response);

    if (response.ok) {
      console.log('Coordinates sent successfully!');
      // You won't be able to access the response body or headers in no-cors mode
      // If you need to handle a successful response, consider doing it on the server side
    } else {
      console.error('Failed to send coordinates:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending coordinates:', error);
  }
};

// Attach click event listener to the send button
sendButton.addEventListener('click', () => {
  errorText.textContent = ''; // Clear previous error messages
  sendRequest();
  // Update the example HTTP request text
  httpRequestText.textContent = `Example HTTP Request: 
  curl -X POST -H "Content-Type: application/json" -d '{"action": "edit", "team_number": ${teamNumberInput.value}, "coordinates": ${JSON.stringify(coordinates)}}" https://MA5951.pythonanywhere.com/update_image`;
});

// Set the canvas dimensions
teamCanvas.width = imageContainer.offsetWidth;
teamCanvas.height = teamCanvas.width * 0.75; // Adjust aspect ratio if needed

// Load the image and draw it on the canvas
const teamImage = new Image();
teamImage.onload = () => {
  // Maintain aspect ratio
  const aspectRatio = teamImage.width / teamImage.height;
  const newWidth = teamCanvas.width;
  const newHeight = newWidth / aspectRatio;
  teamCanvas.height = newHeight;

  ctx.drawImage(teamImage, 0, 0, newWidth, newHeight);
};
teamImage.src = '../src/emptyField.png';
