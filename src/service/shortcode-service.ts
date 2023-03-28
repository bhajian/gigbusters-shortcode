import { DocumentClient, ScanInput } from 'aws-sdk/clients/dynamodb'
import { nanoid, customAlphabet } from 'nanoid/async'
import {
    ShortcodeEntity,
    ShortcodeGetParams
} from "./types";

interface ProfileServiceProps{
    table: string
}

export class ShortcodeService {

    private props: ProfileServiceProps
    private documentClient = new DocumentClient()

    public constructor(props: ProfileServiceProps){
        this.props = props
    }

    async get(params: ShortcodeGetParams): Promise<ShortcodeEntity> {
        const response = await this.documentClient
            .get({
                TableName: this.props.table,
                Key: {
                    shortcode: params.shortcode,
                },
            }).promise()
        return response.Item as ShortcodeEntity
    }

    async put(params: ShortcodeEntity): Promise<ShortcodeEntity> {
        const nanoid = customAlphabet('123', 2)
        params.shortcode = await nanoid()
        try{
            await this.documentClient
                .put({
                    TableName: this.props.table,
                    Item: params,
                }).promise()
        } catch (e) {
            console.log(e)
            throw e
        }
        return params
    }

}
