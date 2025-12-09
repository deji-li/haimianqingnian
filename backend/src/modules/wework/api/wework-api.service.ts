import { Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { WeWorkConfig } from '../entities/wework-config.entity'

export interface WeWorkContact {
  external_userid: string
  name?: string
  avatar?: string
  type: 'single' | 'external'
  gender: 'unknown' | 'male' | 'female'
  position?: string
  corp_name?: string
  follow_userid: string
  remark?: string
  add_time?: number
  tags?: string[]
}

export interface AccessTokenResponse {
  errcode: number
  errmsg: string
  access_token: string
  expires_in: number
}

export interface ExternalContactResponse {
  errcode: number
  errmsg: string
  external_userid: string[]
}

export interface GetContactResponse {
  errcode: number
  errmsg: string
  external_contact: {
    external_userid: string
    name: string
    avatar: string
    type: number
    gender: number
    position: string
    corp_name: string
    corp_full_name: string
    external_profile: {
      external_corp_name: string
      external_attr: any[]
    }
    follow_user: string[]
    remark: string
    description: string
    add_time: number
    tags: any[]
  }
}

@Injectable()
export class WeWorkApiService {
  private readonly logger = new Logger(WeWorkApiService.name)
  private readonly baseURL = 'https://qyapi.weixin.qq.com/cgi-bin'
  private accessToken: string = ''
  private tokenExpireTime: Date | null = null
  private config: WeWorkConfig | null = null

  constructor() {}

  /**
   * 设置企业微信配置
   */
  setConfig(config: WeWorkConfig): void {
    this.config = config
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    // 检查是否已有有效的token
    if (this.accessToken && this.tokenExpireTime && new Date() < this.tokenExpireTime) {
      return this.accessToken
    }

    // 获取新的token
    return await this.refreshAccessToken()
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('企业微信配置未设置')
    }

    try {
      const url = `${this.baseURL}/gettoken`
      const params = {
        corpid: this.config.corpId,
        corpsecret: this.config.appSecret,
      }

      const response = await axios.get<AccessTokenResponse>(url, { params })

      if (response.data.errcode !== 0) {
        throw new Error(`获取access_token失败: ${response.data.errmsg}`)
      }

      this.accessToken = response.data.access_token
      // 设置过期时间，提前5分钟刷新
      this.tokenExpireTime = new Date(Date.now() + (response.data.expires_in - 300) * 1000)

      this.logger.log('企业微信access_token刷新成功')
      return this.accessToken
    } catch (error) {
      this.logger.error('获取企业微信access_token失败:', error)
      throw new Error(`获取企业微信access_token失败: ${error.message}`)
    }
  }

  /**
   * 创建带认证的HTTP客户端
   */
  private async createAuthenticatedClient(): Promise<AxiosInstance> {
    const token = await this.getAccessToken()

    const config: AxiosRequestConfig = {
      baseURL: this.baseURL,
      params: {
        access_token: token,
      },
      timeout: 30000,
    }

    return axios.create(config)
  }

  /**
   * 获取外部联系人列表
   */
  async getExternalContacts(): Promise<WeWorkContact[]> {
    try {
      const client = await this.createAuthenticatedClient()

      // 首先获取外部联系人ID列表
      const contactsResponse = await client.get<ExternalContactResponse>('/externalcontact/get_external_userid_list')

      if (contactsResponse.data.errcode !== 0) {
        throw new Error(`获取外部联系人ID列表失败: ${contactsResponse.data.errmsg}`)
      }

      const externalUserIds = contactsResponse.data.external_userid
      const contacts: WeWorkContact[] = []

      // 获取每个联系人的详细信息
      for (const externalUserId of externalUserIds) {
        try {
          const detailResponse = await client.get<GetContactResponse>('/externalcontact/get', {
            params: { external_userid: externalUserId },
          })

          if (detailResponse.data.errcode === 0) {
            const contact = detailResponse.data.external_contact

            contacts.push({
              external_userid: contact.external_userid,
              name: contact.name,
              avatar: contact.avatar,
              type: contact.type === 1 ? 'single' : 'external',
              gender: this.mapGender(contact.gender),
              position: contact.position,
              corp_name: contact.corp_name,
              follow_userid: contact.follow_user[0] || '',
              remark: contact.remark,
              add_time: contact.add_time,
              tags: contact.tags?.map(tag => tag.tag_name) || [],
            })
          }
        } catch (error) {
          this.logger.warn(`获取联系人${externalUserId}详细信息失败:`, error)
        }
      }

      this.logger.log(`成功获取${contacts.length}个外部联系人`)
      return contacts
    } catch (error) {
      this.logger.error('获取外部联系人列表失败:', error)
      throw new Error(`获取外部联系人列表失败: ${error.message}`)
    }
  }

  /**
   * 获取单个外部联系人详情
   */
  async getExternalContactDetail(externalUserId: string): Promise<WeWorkContact | null> {
    try {
      const client = await this.createAuthenticatedClient()

      const response = await client.get<GetContactResponse>('/externalcontact/get', {
        params: { external_userid: externalUserId },
      })

      if (response.data.errcode !== 0) {
        this.logger.warn(`获取联系人${externalUserId}详情失败: ${response.data.errmsg}`)
        return null
      }

      const contact = response.data.external_contact

      return {
        external_userid: contact.external_userid,
        name: contact.name,
        avatar: contact.avatar,
        type: contact.type === 1 ? 'single' : 'external',
        gender: this.mapGender(contact.gender),
        position: contact.position,
        corp_name: contact.corp_name,
        follow_userid: contact.follow_user[0] || '',
        remark: contact.remark,
        add_time: contact.add_time,
        tags: contact.tags?.map(tag => tag.tag_name) || [],
      }
    } catch (error) {
      this.logger.error(`获取联系人${externalUserId}详情失败:`, error)
      return null
    }
  }

  /**
   * 验证API连接
   */
  async validateApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getAccessToken()
      return {
        success: true,
        message: '企业微信API连接正常',
      }
    } catch (error) {
      return {
        success: false,
        message: `企业微信API连接失败: ${error.message}`,
      }
    }
  }

  /**
   * 映射性别
   */
  private mapGender(gender: number): 'unknown' | 'male' | 'female' {
    switch (gender) {
      case 1:
        return 'male'
      case 2:
        return 'female'
      default:
        return 'unknown'
    }
  }

  /**
   * 发送消息到外部联系人
   */
  async sendMessageToExternalContact(externalUserId: string, content: any): Promise<boolean> {
    try {
      const client = await this.createAuthenticatedClient()

      const response = await client.post('/externalcontact/message/send', {
        touser: externalUserId,
        ...content,
      })

      if (response.data.errcode !== 0) {
        throw new Error(`发送消息失败: ${response.data.errmsg}`)
      }

      this.logger.log(`成功发送消息到外部联系人: ${externalUserId}`)
      return true
    } catch (error) {
      this.logger.error(`发送消息到外部联系人${externalUserId}失败:`, error)
      return false
    }
  }
}