# web-component-designer-codeview-monaco

## NPM Package

https://www.npmjs.com/package/@node-projects/web-component-designer-codeview-monaco

     npm i @node-projects/web-component-designer-codeview-monaco

## Description

This uses the Monaco Editor for the Webcomponent Designer Codeview

## Usage

    import { CodeViewCodeMonaco } from '@node-projects/web-component-designer-codeview-monaco';
    serviceContainer.config.codeViewWidget = CodeViewCodeMonaco;

You need to load the monaco manualy and call

     await CodeViewCodeMonaco.setMonacoLibrary(...); 
     
or via

     await CodeViewCodeMonaco.loadMonacoEditorViaRequire(); 

or

     await CodeViewCodeMonaco.loadMonacoEditorViaImport();

or

     <script src="./node_modules/monaco-editor/min/vs/loader.js"></script>
     <script>
          require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs', 'vs/css': { disabled: true } } });
          require(['vs/editor/editor.main'], () => { });    
     </script>