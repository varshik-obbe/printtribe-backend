import getToken from "../../utils/getWixToken";


export const testToken = async (req,res) => {
    const { tokenData } = req.body;

    let token = "";
    token = await getToken(tokenData.auth_code,tokenData.customer_id);

    console.log("token is"+token)
    if(token != "")
    {
        res.status(201).json({ success: "success" })
    }
    else {
        res.status(400).json({ error: "error" })
    }
}

export const tokenWebhook = (req,res) => {
    const data = req.body;

    console.log("event type is"+data.eventType);

    res.status(200).json({ global: { success: "response" } })
}

export default { testToken, tokenWebhook }