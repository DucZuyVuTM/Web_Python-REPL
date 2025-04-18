let pyodide;
let outputElement = document.getElementById("output");
let inputElement = document.getElementById("input");
let runButton = document.getElementById("run-button");

async function initializePyodide() {
    try {
        pyodide = await loadPyodide();
        document.getElementById("loading").style.display = "none";
        inputElement.disabled = false;
        inputElement.focus();
        outputElement.textContent = "Pyodide loaded. Enter Python code above (Ctrl + Enter to run).\n";
    } catch (error) {
        outputElement.textContent = "Error loading Pyodide: " + error.message;
    }
}

function appendOutput(text) {
    outputElement.textContent += text + "\n";
    outputElement.scrollTop = outputElement.scrollHeight;
}

async function runCode(code) {
    // Display code with >>> prefix for each line
    let codeLines = code.trim().split('\n').map(line => `>>> ${line}`).join('\n');
    appendOutput(codeLines);

    try {
        // Redirect stdout to capture print statements
        pyodide.runPython(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
        `);
        
        // Evaluate the code
        let result = await pyodide.runPythonAsync(code);
        
        // Get stdout content
        let stdout = pyodide.runPython("sys.stdout.getvalue()");
        pyodide.runPython("sys.stdout = sys.__stdout__"); // Reset stdout
        
        // Display stdout if any
        if (stdout) {
            appendOutput(stdout.trim());
        }
        
        // Display result if it's not undefined
        if (result !== undefined) {
            appendOutput(result.toString());
        }
    } catch (error) {
        appendOutput("Error: " + error.message);
    }
}

function handleInput(event) {
    if (event.ctrlKey && event.key === "Enter") {
        let code = inputElement.value.trim();
        if (code) {
            runCode(code);
            inputElement.value = "";
        }
    }
}

function executeCode() {
    let code = inputElement.value.trim();
    if (code) {
        runCode(code);
        inputElement.value = "";
    }
}

inputElement.addEventListener("keydown", handleInput);
runButton.addEventListener("click", executeCode);

initializePyodide();
