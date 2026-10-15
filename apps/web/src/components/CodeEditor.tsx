import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/languages/definitions/cpp/register.js';
import 'monaco-editor/languages/definitions/python/register.js';
import 'monaco-editor/languages/definitions/javascript/register.js';
import 'monaco-editor/languages/definitions/html/register.js';
import 'monaco-editor/languages/definitions/css/register.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: number | string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

/** Editor de texto somente. Não compila nem executa o conteúdo. */
export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = 360,
  options,
}: CodeEditorProps) {
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const change = useRef(onChange);
  const updating = useRef(false);
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (!container.current) return;
    const instance = monaco.editor.create(container.current, {
      value: '',
      language: 'plaintext',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      ariaLabel: 'Editor de código',
      editContext: false,
      theme: 'vs-dark',
    });
    editor.current = instance;
    const listener = instance.onDidChangeModelContent(() => {
      if (!updating.current) change.current(instance.getValue());
    });
    return () => {
      listener.dispose();
      const model = instance.getModel();
      instance.dispose();
      model?.dispose();
      editor.current = null;
    };
  }, []);
  useEffect(() => {
    const instance = editor.current;
    if (!instance) return;
    instance.updateOptions({ ...options, readOnly, automaticLayout: true });
    const model = instance.getModel();
    if (model)
      monaco.editor.setModelLanguage(
        model,
        language === 'arduino' ? 'cpp' : language,
      );
  }, [language, options, readOnly]);
  useEffect(() => {
    const instance = editor.current;
    if (instance && instance.getValue() !== value) {
      updating.current = true;
      instance.setValue(value);
      updating.current = false;
    }
  }, [value]);
  return (
    <div
      className="code-editor"
      ref={container}
      style={{ height, width: '100%', minWidth: 0 }}
    />
  );
}
