'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

//Demo: Import classes
import HoverProvider from './HoverProvider';
import GoDefinitionProvider from './GoDefinitionProvider';
import CustomPolicyExplorerProvider from './CustomPolicyExplorerProvider';
import ApplicationInsightsExplorerExplorerProvider from './ApplicationInsightsExplorerExplorerProvider';
import { ReferenceProvider } from './ReferenceProvider';
import InsertCommands from './InsertCommands';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "aadb2c" is now active!');

    //Demo: Custom Policy Explorer
    const customPolicyExplorerProvider = new CustomPolicyExplorerProvider();
    vscode.window.registerTreeDataProvider('CustomPolicyExplorer', customPolicyExplorerProvider);
    vscode.commands.registerCommand('jsonOutline.refresh', () => customPolicyExplorerProvider.refresh());
    vscode.commands.registerCommand('jsonOutline.refreshNode', offset => customPolicyExplorerProvider.refresh(offset));
    vscode.commands.registerCommand('extension.openJsonSelection', range => customPolicyExplorerProvider.select(range));

    //Demo: Application Insights Explorer
    const applicationInsightsExplorerProvider = new ApplicationInsightsExplorerExplorerProvider(context);
    vscode.window.registerTreeDataProvider('ApplicationInsightsExplorer', applicationInsightsExplorerProvider);
    vscode.commands.registerCommand('ApplicationInsightsExplorer.refresh', () => applicationInsightsExplorerProvider.refresh());
    vscode.commands.registerCommand('ApplicationInsightsExplorer.show', range => applicationInsightsExplorerProvider.show(range));
    vscode.commands.registerCommand('ApplicationInsightsExplorer.settings', range => applicationInsightsExplorerProvider.settings());

    // Demo: Find all reference
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            "xml", new ReferenceProvider()));

    // Demo: register go to definiton provider
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider([
            { language: 'xml', scheme: 'file', pattern: '**/*xml*' }
        ],
            new GoDefinitionProvider()));

    // Demo: register find all references
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider([
            { language: 'xml', scheme: 'file', pattern: '**/*xml*' }
        ],
            new ReferenceProvider()));

    // Demo: register the hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider([
            { language: 'xml', scheme: 'file', pattern: '**/*xml*' }
        ],
            new HoverProvider()));


    // Add Claim Type command
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertClaimType', () => InsertCommands.InsertClaimType()));

    // Add Identity provider technical profile command
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertTechnicalProfileIdp', () => InsertCommands.InsertTechnicalProfileIdp()));

    // Add REST API technical profile command
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertTechnicalProfileRESTAPI', () => InsertCommands.InsertTechnicalProfileRESTAPI()));

    // Add application insights command
    context.subscriptions.push(vscode.commands.registerCommand('ApplicationInsightsExplorer.add', () => InsertCommands.InsertApplicationInsights()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
