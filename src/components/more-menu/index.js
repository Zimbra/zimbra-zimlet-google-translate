import { createElement, Component } from 'preact';
import { withIntl } from '../../enhancers';
import style from './style';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';

// Please take a look at https://cloud.google.com/translate/attribution before using this Zimlet.

//Initialize and get translations from json files in intl folder
@withIntl()
@withText({
    title: 'gtranslate-zimlet.title',
    okBtn: 'gtranslate-zimlet.okBtn',
    error: 'gtranslate-zimlet.error'
})

//create class component
export default class MoreMenu extends Component {
    constructor(props) {
        super(props);
        //store the Zimlet context to the class
        this.zimletContext = props.children.context;
        
        //A conversation is selected, take newest message
        if(Array.isArray(this.props.emailData.messages))
        {
           this.props.emailData = this.props.emailData.messages[0];
        }
    }

    //This shows a toaster message/notification to the user, used in case there are errors calling Google Translates
    alert = (message) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.notifications.notify({
            message: message
        }));
    }

    //remove html code from the email, translate only the text body
    strip = (html) => {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    //called when the user clicks the menu item
    handleClick = () => {
        /* In case the email was in text/plain format we can use this.props.emailData.text as the source for the translation, 
        otherwise we strip the html using the strip method (from above) and use that */
        let text = "";
        if (this.props.emailData.text) {
            text = this.props.emailData.text;
        }
        else {
            text = this.strip(this.props.emailData.html);
        }

        //Since it uses a GET request we need to make sure it is not too long.
        if (encodeURI(text).length > 4800) {
            text = text.substring(0, 4000) + '...';
        }

        //Do the request
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
            + "auto" + "&tl=" + this.props.locale + "&dt=t&q=" + encodeURI(text);

        var request = new XMLHttpRequest();
        let translateResult = "";
        request.open('GET', url);
        request.responseType = 'json'
        request.onreadystatechange = function (e) {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    for (var i = 0; i < request.response[0].length; i++) {
                        translateResult += this.strip(request.response[0][i][0]) + "\r\n";
                    }
                    //Show result to the user
                    this.showDialog(translateResult);
                }
                else {
                    this.alert(this.props.error);
                }
            }
        }.bind(this);
        request.send();
    }

    //shows a modal dialog to the user with the translate result
    showDialog = (translateResult) => {
        const { title } = this.props;
        this.modal = (
            <ModalDialog
                class={style.modalDialog}
                contentClass={style.modalContent}
                innerClass={style.inner}
                onClose={this.handleClose}
                cancelButton={false}
                header={false}
                footer={false}
            >
                <header class="zimbra-client_modal-dialog_header"><h2>{title}</h2><button onClick={this.handleClose} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                    <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">
                        <div id="translateResult" style="white-space: pre-wrap;">{translateResult}<br/></div>
                        <div class={style.attribution}></div>
                    </div>
                    <footer class="zimbra-client_modal-dialog_footer" id="nextcloudDialogButtons">
                        <button onClick={this.handleClose} class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button">{this.props.okBtn}</button>
                    </footer>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: this.modal }));

    }

    //implements closing of the dialog, when the user clicks OK button.
    handleClose = e => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
    }

    //Returns the `Translate with Google` menu item.
    render() {
        return (
            <div>
                <ActionMenuItem onClick={this.handleClick}>
                    Translate with Google
                </ActionMenuItem>
            </div>
        );
    }

}
