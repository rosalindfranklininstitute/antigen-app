class PopupWindow {
    private url: string;
    private window: Window | null;
    promise: Promise<Map<string, string>> | null;
    private _iid: number | null;

    constructor(url: string) {
        this.url = url;
        this.window = null;
        this.promise = null;
        this._iid = null;
    };

    open() {
        this.window = window.open(this.url, "github-login", "width=600, height=800");
    }

    close() {
        this.cancel();
        this.window?.close();
    }

    poll() {
        this.promise = new Promise((resolve, reject) => {
            if (!this.window) {
                reject(new Error('No window'))
                return;
            }
            this._iid = this.window?.setInterval(() => {
                try {
                    const popup = this.window;

                    if (!popup || popup.closed !== false) {
                        this.close();

                        reject(new Error('The popup was closed'));
                        return;
                    }

                    if (popup.location.href === this.url || popup.location.pathname === 'blank') {
                        return;
                    }

                    const params = popup.location.search.replace(/^\?/, '').split('&').reduce((values: Map<string, string>, param: string) => {
                        const [key, value] = param.split('=');

                        values.set(key ,value);
                        return values;
                    }, new Map());

                    resolve(params);
                    this.close();
                } catch (error) {
                    reject(error);
                }
            }, 500);
        });
    };

    cancel() {
        if (this._iid) {
            this.window?.clearInterval(this._iid);
            this._iid = null;
        }
    }

    then(onfulfilled: ((value: Map<string, string>) => void), onrejected: ((reason: Error) => void)) {
        return this.promise?.then(onfulfilled, onrejected)
    }

    static open(url: string) {
        const popup = new this(url);
        popup.open();
        popup.poll();

        return popup;
    }
};

function GithubLogin(props: {clientId: string, scope: string, redirectUri: string}) {
    const onSuccess = async (data: Map<string, string>) => {
        const code = data.get('code');
        if (code) {
            console.log(`Got Code: ${code}`);
            const response = await fetch('http://127.0.0.1:8000/api/auth/github/', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({code: code})
            });
            const response_data = await response.json();
            console.log(`Got Response: ${JSON.stringify(response_data)}`)
        } else {
            return onFailure(new Error('\'code\' not found'));
        };
    };

    const onFailure = (reason: Error) => {
        console.log(reason);
    };

    const onBtnClick = () => {
        const popup = PopupWindow.open(`https://github.com/login/oauth/authorize/?client_id=${props.clientId}`);
        popup.promise?.then(
            value => onSuccess(value),
            reason => onFailure(reason)
        );
    };

    return <button onClick={onBtnClick}>Log in with GitHub</button>   
};

export default GithubLogin;