// ** Next Import
import dynamic, { Loader } from 'next/dynamic';

// ** Types
import { EditorProps } from 'react-draft-wysiwyg';

// ! To avoid 'Window is not defined' error
const ReactDraftWysiwyg = dynamic<EditorProps>((() => import('react-draft-wysiwyg').then(mod => mod.Editor)) as Loader<EditorProps>, {
	ssr: false
});

export default ReactDraftWysiwyg;
