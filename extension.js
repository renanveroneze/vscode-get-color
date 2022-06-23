const vscode = require( 'vscode' )
const fs = require( 'fs' )
const path = require( 'path' )


function activate( context ) {

    let disposable = vscode.commands.registerCommand( 'get-color.get-color', async function () {

        const folder = vscode.workspace.workspaceFolders[ 0 ].uri.path
        const profile = fs.readFileSync( path.join( folder, '_sources', 'styles', 'vars', 'colors.styl' ).replace( /^\\/, '' ) )
            .toString()
            .replace( /\/.*/g, '' )
            .replace( '$colors = {', '' )
            .replace( '}', '' )
            .replace( /\s/g, '' )
            .split( ',' )
            .filter( Boolean )
            .map( ( e ) => e.split( ':' ) )
            .map( ( [ key, val ] ) => ( { "label": key, detail: val, value: `$colors.${key}` } ) )

        let selected_color = await vscode.window.showQuickPick( profile )

        if( !selected_color ) return

        const editor = vscode.window.activeTextEditor

        if( editor ) {
            const document = editor.document
            editor.edit( editBuilder => {
                editor.selections.forEach( sel => {
                    const range = sel.isEmpty ? document.getWordRangeAtPosition( sel.start ) || sel : sel
                    let color = selected_color.value
                    editBuilder.replace( range, color )
                } )
            } )
        }

    } )

    context.subscriptions.push( disposable )
}

function deactivate() { }

module.exports = { activate, deactivate }
