import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import Consts from './Consts';
export default class PolicBuild {
    static Build() {


        var rootPath: string;
        // Check if a folder is opend
        if ((!vscode.workspace.workspaceFolders) || (vscode.workspace.workspaceFolders.length == 0)) {
            vscode.window.showInformationMessage("To build and a policy you need to open the policy folder in VS code");
            return;
        }

        rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        var filePath = path.join(rootPath, "appsettings.json");

        // Check if appsettings.json is existed under for root folder
        vscode.workspace.findFiles(new vscode.RelativePattern(vscode.workspace.rootPath as string, 'appsettings.json'))
            .then((uris) => {

                if (!uris || uris.length == 0) {
                    vscode.window.showQuickPick(["Yes", "No"], { placeHolder: 'The appsettings.json file is missing, do you want to create?' })
                        .then(result => {
                            if (!result || result === "No")
                                return;

                            // Create app settings file with default values
                            fs.writeFile(filePath, Consts.DefaultDeploymentSettings, 'utf8', (err) => {
                                if (err) throw err;

                                vscode.workspace.openTextDocument(filePath).then(doc => {
                                    vscode.window.showTextDocument(doc);
                                });
                            });
                        });
                }
                else {

                    // Read all policy files from the root directory
                    vscode.workspace.findFiles(new vscode.RelativePattern(vscode.workspace.rootPath as string, '*.{xml}'))
                        .then((uris) => {
                            let policyFiles: PolicyFile[] = [];
                            uris.forEach((uri) => {
                                if (uri.fsPath.indexOf("?") <= 0) {
                                    var data = fs.readFileSync(uri.fsPath, 'utf8');
                                    policyFiles.push(new PolicyFile(path.basename(uri.fsPath), data.toString()))
                                }
                            });

                            return policyFiles;
                        }).then((policyFiles) => {

                            // Get the app settings
                            vscode.workspace.openTextDocument(filePath).then(doc => {
                                var appSettings = JSON.parse(doc.getText());
                                var environmentsRootPath = path.join(rootPath, "Environments");

                                // Ensure environments folder exists
                                if (!fs.existsSync(environmentsRootPath)) {
                                    fs.mkdirSync(environmentsRootPath);
                                }

                                // Iterate through environments  
                                appSettings.Environments.forEach(function (entry) {
                                    var environmentRootPath = path.join(environmentsRootPath, entry.Name);

                                    // Ensure environment folder exists
                                    if (!fs.existsSync(environmentRootPath)) {
                                        fs.mkdirSync(environmentRootPath);
                                    }

                                    // Iterate through the list of settings
                                    policyFiles.forEach(function (file) {

                                        var policContent = file.Data;

                                        Object.keys(entry).forEach(key => {
                                            policContent = policContent.replace(new RegExp("\{Settings:" + key + "\}", "g"), entry[key]);
                                        });

                                        // Save the  policy
                                        fs.writeFile(path.join(environmentRootPath, file.FileName), policContent, 'utf8', (err) => {
                                            if (err) throw err;
                                        });
                                    });
                                });

                            });
                        });
                }

            });
    };
}

export class PolicyFile {
    public FileName: string;
    public Data: string;

    constructor(fileName: string, data: string) {
        this.FileName = fileName;
        this.Data = data;
    }
}