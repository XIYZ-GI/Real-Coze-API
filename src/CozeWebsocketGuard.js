import WebSocket from "ws";
function CozeWebsocketGuard(url) {
    this.ws = new WebSocket(url);
    this.ready = false
    this.ws.on('open', () => {
        console.log('[CozeRealAPI WebSocket]已连接至CozeWebSocket服务器');
        this.ready = true
    });
    this.ws.on('close', () => {
        console.log('[CozeRealAPI WebSocket]已断开CozeWebSocket服务器连接');
        this.ready = false
        setTimeout(() => {
            this.ws = new WebSocket(url);
        }, 3000);
    });
    this.ws.on('error', function error(err) {
        throw err;
    });
    this.ws.on('message', (data) => {
        const StringData = data.toString()
        const JsonData = JSON.parse(StringData.substring(StringData.indexOf('{'), StringData.lastIndexOf('}') + 1))
        if (JsonData.event_type === 1 && JsonData.message.reply_type === 1) {
            if (!!JsonData.message.ext && !!JsonData.message.ext.PushUuid && typeof this.ResponseData[JsonData.message.ext.PushUuid] === 'function') {
                this.ResponseData[JsonData.message.ext.PushUuid]({
                    content: JsonData.message.content,
                    continue: JsonData.message.ext.is_finish === "0"
                })
                if (JsonData.message.ext.is_finish === "1") {
                    delete this.ResponseData[JsonData.message.ext.PushUuid]
                }
            }
        }
    });
    this.ResponseData = {}
    this.addMessageListener = function (PushUuid, callback) {
        this.ResponseData[PushUuid] = callback
    }
    this.close = function () {
        this.ws.close()
    }


}

export default CozeWebsocketGuard;