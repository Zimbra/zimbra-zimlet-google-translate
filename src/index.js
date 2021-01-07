//Load components from Zimbra
import { createElement } from "preact";

//Load the createMore function from our Zimlet component
import createMore from "./components/more";

//Create function by Zimbra convention
export default function Zimlet(context) {
	//Get the 'plugins' object from context and define it in the current scope
	const { plugins } = context;
	const exports = {};

	//moreMenu stores a Zimlet menu item. We pass context to it here
	const moreMenu = createMore(context);

	exports.init = function init() {
		// The zimlet slots to load into, and what is being loaded into that slot
		// (CustomMenuItem and Router are both defined below)
		plugins.register("slot::action-menu-mail-more", moreMenu);
	};

	return exports;
}
