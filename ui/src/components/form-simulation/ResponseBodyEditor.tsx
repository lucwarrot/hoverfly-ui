import React, { useMemo, useRef, useState } from 'react';
import MonacoEditor, { Monaco, OnMount } from '@monaco-editor/react';
import { isJSON, prettify } from '../../services/json-service';
import { editor } from 'monaco-editor';
import { Button } from 'react-bootstrap';

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

const MIN_EDITOR_LINE = 10;
const MAX_EDITOR_LINE = 50;

const ResponseBodyEditor = ({ value = '', onChange }: Props) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  const [editorHeightPx, setEditorHeightPx] = useState(100);
  const isBodyJson = useMemo(() => isJSON(value), [value]);

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    updateEditorHeight();
  };

  const prettifyEditorContent = () => {
    if (!editorRef.current) {
      return;
    }

    onChange(prettify(value));
    updateEditorHeight();
  };

  const updateEditorHeight = () => {
    if (!monacoRef.current?.editor.EditorOption.lineHeight || !editorRef.current?.getOptions()) {
      return;
    }

    const options = editorRef.current.getOptions();
    const editorLineHeight = options.get(monacoRef.current.editor.EditorOption.lineHeight) || 18;
    const lineCount = Math.min(
      Math.max(editorRef.current?.getModel()?.getLineCount() || 0, MIN_EDITOR_LINE),
      MAX_EDITOR_LINE
    );
    setEditorHeightPx(editorLineHeight * lineCount);
  };

  const onEditorValueChange = (json: string | undefined) => {
    if (editorRef.current?.hasTextFocus()) {
      onChange(json ?? '');
      updateEditorHeight();
    }
  };

  return (
    <div className="row gap-2">
      <div>
        <Button variant="outline-success" onClick={prettifyEditorContent}>
          Prettify
        </Button>
      </div>
      <div className="col-11" data-testid="response-body-editor">
        <MonacoEditor
          width="100%"
          height={`${editorHeightPx}px`}
          language={isBodyJson ? 'json' : ''}
          theme="vs-dark"
          value={value}
          onMount={onEditorMount}
          onChange={onEditorValueChange}
          options={{
            wordWrap: 'on',
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            formatOnType: true,
            scrollbar: {
              handleMouseWheel: false
            }
          }}
        />
      </div>
    </div>
  );
};

export default ResponseBodyEditor;
