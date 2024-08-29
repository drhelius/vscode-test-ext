// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-test-ext.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello Nash from vscode-test-ext!');
	});

	context.subscriptions.push(disposable);

	vscode.chat.createChatParticipant('chat-test.nash', async (request, context, response, token) => {
		
		const userQuery = request.prompt;
		const chatModels = await vscode.lm.selectChatModels({family: 'gpt-4'});
		
		const apiResponse = await callExternalApi(userQuery);
		console.log("API resp: " + JSON.stringify(apiResponse));

		const messages = [
			vscode.LanguageModelChatMessage.User("User query: " + userQuery + "\n\nAdditional Context: " + apiResponse.text)
		];
		
		const chatRequest = await chatModels[0].sendRequest(messages, undefined, token);

		for await (const token of chatRequest.text) {
			response.markdown(token);
		}
	});

}

async function callExternalApi(message: string): Promise<any> {
    const url = 'http://127.0.0.1:9001/ask';
    const headers = {
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
        question: message,
        filters: [{}],
        index: "",
        args: {
            custom_rag_max_tokens_int: 1000
        }
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
