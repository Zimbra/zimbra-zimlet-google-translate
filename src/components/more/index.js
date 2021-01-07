import { createElement } from 'preact';
import MoreMenu from '../more-menu';

export default function createMore(context) {
	return props => (
		<MoreMenu {...props}>{{context}}</MoreMenu>
	);
}
