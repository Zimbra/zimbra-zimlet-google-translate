import { createElement, Component } from 'preact';
import { withIntl } from '../../enhancers';
import style from './style';
import { ModalDialog, ActionMenuItem, NakedButton } from '@zimbra-client/components';
import { withText } from 'preact-i18n';

@withIntl()
@withText({
    title: 'gtranslate-zimlet.title',
    okBtn: 'gtranslate-zimlet.okBtn',
    error: 'gtranslate-zimlet.error'
})

export default class MoreMenu extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
    }

    alert = (message) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.notifications.notify({
            message: message
        }));
    }

    strip = (html) => {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    handleClick = () => {
        let text = "";
        if (this.props.emailData.text) {
            text = this.props.emailData.text;
        }
        else {
            text = this.strip(this.props.emailData.html);
        }
        if (encodeURI(text).length > 4800) {
            text = text.substring(0, 4000) + '...';
        }
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
                        translateResult += this.strip(request.response[0][i][0])+"\r\n";
                    }
                    this.showDialog(translateResult);
                }
                else {
                    this.alert(this.props.error);
                }
            }
        }.bind(this);
        request.send();
    }

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
                <div class="zimbra-client_modal-dialog_inner"><header class="zimbra-client_modal-dialog_header"><h2>{title}</h2><button onClick={this.handleClose} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                    <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">
                        <div id="translateResult" style="white-space: pre-wrap;">{translateResult}</div>
                        <div class={style.attribution}></div> 
                    </div>
                    <footer class="zimbra-client_modal-dialog_footer" id="nextcloudDialogButtons">
                        <button onClick={this.handleClose} class="blocks_button_button blocks_button_primary blocks_button_regular zimbra-client_sidebar-primary-button_button">{this.props.okBtn}</button>
                    </footer>
                </div>
            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: this.modal }));

    }

    handleClose = e => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
    }

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
