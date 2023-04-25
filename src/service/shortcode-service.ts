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
        const nanoid = customAlphabet(
            '1234567890abcdefghijklmnopqrstuvwxyz', 6)
        let err = undefined
        for(let retry = 0; retry < 100; retry++){
            params.shortcode = await nanoid()
            try{
                await this.documentClient
                    .put({
                        TableName: this.props.table,
                        Item: params,
                        ConditionExpression: 'attribute_not_exists(shortcode)'
                    }).promise()
                err = undefined
                break
            } catch (e) {
                err = e
            }
        }
        if(err){
            throw new Error('Collisions in generating short code exceeded 100 times.')
        }
        return params
    }

}
