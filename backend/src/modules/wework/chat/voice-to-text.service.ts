import { Injectable, Logger } from '@nestjs/common'
import { AiCacheService } from '../../../common/services/ai/ai-cache.service'
import { DeepseekAnalysisService } from '../../../common/services/ai/deepseek-analysis.service'

export interface VoiceTranscriptionResult {
  text: string
  confidence: number
  duration: number
  language?: string
  format: string
  timestamp: Date
}

export interface VoiceProcessOptions {
  language?: string
  format?: string
  enablePunctuation?: boolean
  enableTimestamp?: boolean
}

@Injectable()
export class WeWorkVoiceToTextService {
  private readonly logger = new Logger(WeWorkVoiceToTextService.name)
  private readonly cachePrefix = 'wework:voice:'

  // 支持的音频格式
  private readonly supportedFormats = ['silk', 'amr', 'mp3', 'wav', 'flac', 'm4a']

  constructor(
    private readonly aiCacheService: AiCacheService,
    private readonly deepSeekService: DeepseekAnalysisService,
  ) {}

  /**
   * 语音转文字
   */
  async transcribeVoice(
    audioData: Buffer,
    options: VoiceProcessOptions = {}
  ): Promise<VoiceTranscriptionResult> {
    const startTime = Date.now()
    const audioHash = this.generateAudioHash(audioData)

    try {
      // 检查缓存
      const cacheKey = `${this.cachePrefix}${audioHash}:${JSON.stringify(options)}`
      const cached = await this.aiCacheService.get(cacheKey)
      if (cached) {
        this.logger.log(`语音转文字缓存命中: ${audioHash}`)
        return JSON.parse(cached)
      }

      this.logger.log(`开始语音转文字处理: ${audioData.length} bytes`)

      // 预处理音频数据
      const processedAudio = await this.preprocessAudio(audioData, options.format)

      // 识别音频格式
      const audioFormat = this.detectAudioFormat(processedAudio)

      // 根据格式选择转写服务
      let transcription: VoiceTranscriptionResult

      switch (audioFormat) {
        case 'silk':
          transcription = await this.transcribeSilkAudio(processedAudio, options)
          break
        case 'amr':
          transcription = await this.transcribeAmrAudio(processedAudio, options)
          break
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'm4a':
          transcription = await this.transcribeStandardAudio(processedAudio, options)
          break
        default:
          throw new Error(`不支持的音频格式: ${audioFormat}`)
      }

      // 后处理文本
      transcription.text = this.postProcessText(transcription.text, options)

      // 计算处理时间
      transcription.timestamp = new Date()
      const processingTime = Date.now() - startTime
      this.logger.log(`语音转文字完成: ${transcription.text.substring(0, 50)}, 耗时: ${processingTime}ms`)

      // 缓存结果（1小时）
      await this.aiCacheService.set(
        cacheKey,
        JSON.stringify(transcription),
        60 * 60
      )

      return transcription
    } catch (error) {
      this.logger.error('语音转文字失败:', error)
      throw error
    }
  }

  /**
   * 预处理音频数据
   */
  private async preprocessAudio(audioData: Buffer, targetFormat?: string): Promise<Buffer> {
    try {
      // 如果指定了目标格式且与当前格式不同，进行格式转换
      if (targetFormat) {
        const currentFormat = this.detectAudioFormat(audioData)
        if (currentFormat !== targetFormat) {
          return await this.convertAudioFormat(audioData, currentFormat, targetFormat)
        }
      }

      return audioData
    } catch (error) {
      this.logger.error('音频预处理失败:', error)
      throw error
    }
  }

  /**
   * 转换Silk格式音频
   */
  private async transcribeSilkAudio(
    audioData: Buffer,
    options: VoiceProcessOptions
  ): Promise<VoiceTranscriptionResult> {
    try {
      // 将Silk转换为标准格式
      const standardAudio = await this.convertSilkToWav(audioData)

      // 调用标准音频转写
      return await this.transcribeStandardAudio(standardAudio, options)
    } catch (error) {
      this.logger.error('Silk音频转写失败:', error)
      throw error
    }
  }

  /**
   * 转换AMR格式音频
   */
  private async transcribeAmrAudio(
    audioData: Buffer,
    options: VoiceProcessOptions
  ): Promise<VoiceTranscriptionResult> {
    try {
      // 将AMR转换为标准格式
      const standardAudio = await this.convertAmrToWav(audioData)

      // 调用标准音频转写
      return await this.transcribeStandardAudio(standardAudio, options)
    } catch (error) {
      this.logger.error('AMR音频转写失败:', error)
      throw error
    }
  }

  /**
   * 转写标准格式音频
   */
  private async transcribeStandardAudio(
    audioData: Buffer,
    options: VoiceProcessOptions
  ): Promise<VoiceTranscriptionResult> {
    try {
      // 这里可以集成第三方语音识别服务
      // 例如：阿里云、腾讯云、百度云等的语音识别API

      // 模拟语音识别结果（实际项目中应该调用真实的API）
      const mockResult: VoiceTranscriptionResult = {
        text: this.generateMockTranscription(audioData.length),
        confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95的随机置信度
        duration: this.estimateAudioDuration(audioData),
        language: options.language || 'zh-CN',
        format: 'wav'
      }

      return mockResult
    } catch (error) {
      this.logger.error('标准音频转写失败:', error)
      throw error
    }
  }

  /**
   * 检测音频格式
   */
  private detectAudioFormat(audioData: Buffer): string {
    try {
      // 通过文件头检测音频格式
      const header = audioData.slice(0, 16)

      // Silk格式检测
      if (this.isSilkFormat(header)) {
        return 'silk'
      }

      // AMR格式检测
      if (this.isAmrFormat(header)) {
        return 'amr'
      }

      // MP3格式检测
      if (this.isMp3Format(header)) {
        return 'mp3'
      }

      // WAV格式检测
      if (this.isWavFormat(header)) {
        return 'wav'
      }

      // FLAC格式检测
      if (this.isFlacFormat(header)) {
        return 'flac'
      }

      // M4A格式检测
      if (this.isM4aFormat(header)) {
        return 'm4a'
      }

      return 'unknown'
    } catch (error) {
      this.logger.error('检测音频格式失败:', error)
      return 'unknown'
    }
  }

  /**
   * 检测是否为Silk格式
   */
  private isSilkFormat(header: Buffer): boolean {
    // Silk格式的文件头特征
    const silkSignature = Buffer.from([0x23, 0x53, 0x49, 0x4C, 0x4B]) // "#SILK"
    return header.slice(0, 5).equals(silkSignature)
  }

  /**
   * 检测是否为AMR格式
   */
  private isAmrFormat(header: Buffer): boolean {
    // AMR格式的文件头特征
    const amrSignature = Buffer.from([0x23, 0x21, 0x41, 0x4D, 0x52]) // "#!AMR"
    return header.slice(0, 5).equals(amrSignature)
  }

  /**
   * 检测是否为MP3格式
   */
  private isMp3Format(header: Buffer): boolean {
    // MP3 ID3标签或MPEG音频帧头
    return (
      header.slice(0, 3).equals(Buffer.from([0x49, 0x44, 0x33])) || // ID3v2
      (header[0] === 0xFF && (header[1] & 0xE0) === 0xE0) // MPEG帧头
    )
  }

  /**
   * 检测是否为WAV格式
   */
  private isWavFormat(header: Buffer): boolean {
    // RIFF/WAVE文件头
    return header.slice(0, 4).equals(Buffer.from([0x52, 0x49, 0x46, 0x46])) && // "RIFF"
           header.slice(8, 12).equals(Buffer.from([0x57, 0x41, 0x56, 0x45])) // "WAVE"
  }

  /**
   * 检测是否为FLAC格式
   */
  private isFlacFormat(header: Buffer): boolean {
    // FLAC文件头
    return header.slice(0, 4).equals(Buffer.from([0x66, 0x4C, 0x61, 0x43])) // "fLaC"
  }

  /**
   * 检测是否为M4A格式
   */
  private isM4aFormat(header: Buffer): boolean {
    // M4A文件头（ftyp box）
    return header.slice(4, 8).equals(Buffer.from([0x66, 0x74, 0x79, 0x70])) // "ftyp"
  }

  /**
   * 转换Silk格式到WAV
   */
  private async convertSilkToWav(silkData: Buffer): Promise<Buffer> {
    try {
      // 这里需要集成Silk解码器
      // 可以使用silk-v3-decoder等工具
      this.logger.log('Silk格式转换功能待实现，返回原始数据')
      return silkData
    } catch (error) {
      this.logger.error('Silk格式转换失败:', error)
      throw error
    }
  }

  /**
   * 转换AMR格式到WAV
   */
  private async convertAmrToWav(amrData: Buffer): Promise<Buffer> {
    try {
      // 这里需要集成AMR解码器
      this.logger.log('AMR格式转换功能待实现，返回原始数据')
      return amrData
    } catch (error) {
      this.logger.error('AMR格式转换失败:', error)
      throw error
    }
  }

  /**
   * 转换音频格式
   */
  private async convertAudioFormat(
    audioData: Buffer,
    fromFormat: string,
    toFormat: string
  ): Promise<Buffer> {
    try {
      // 这里可以使用FFmpeg等工具进行格式转换
      this.logger.log(`音频格式转换: ${fromFormat} -> ${toFormat}`)
      return audioData // 暂时返回原始数据
    } catch (error) {
      this.logger.error('音频格式转换失败:', error)
      throw error
    }
  }

  /**
   * 估算音频时长
   */
  private estimateAudioDuration(audioData: Buffer): number {
    try {
      // 这里可以根据音频格式和文件大小估算时长
      // 简单的估算方法：假设平均码率为32kbps
      const estimatedBitRate = 32000 // 32kbps
      const durationSeconds = (audioData.length * 8) / estimatedBitRate
      return Math.round(durationSeconds)
    } catch (error) {
      return 10 // 默认10秒
    }
  }

  /**
   * 生成音频数据哈希
   */
  private generateAudioHash(audioData: Buffer): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(audioData).digest('hex')
  }

  /**
   * 后处理文本
   */
  private postProcessText(text: string, options: VoiceProcessOptions): string {
    if (!text) return text

    // 清理文本
    text = text.trim()

    // 启用标点符号
    if (options.enablePunctuation) {
      text = this.addPunctuation(text)
    }

    // 移除重复内容
    text = this.removeRepeats(text)

    return text
  }

  /**
   * 添加标点符号
   */
  private addPunctuation(text: string): string {
    // 简单的标点符号添加逻辑
    text = text.replace(/\s+/g, ' ')

    // 在句子末尾添加句号
    if (!/[。！？]$/.test(text)) {
      text += '。'
    }

    return text
  }

  /**
   * 移除重复内容
   */
  private removeRepeats(text: string): string {
    // 移除连续重复的词语
    return text.replace(/(\S{2,})\1+/g, '$1')
  }

  /**
   * 生成模拟转写结果（仅用于开发测试）
   */
  private generateMockTranscription(audioLength: number): string {
    const mockTexts = [
      '请问你们机构的课程费用是多少？',
      '我想了解一下你们的教学环境。',
      '孩子今年五岁了，适合报什么课程？',
      '你们的师资力量怎么样？',
      '请问有试听课吗？',
      '我想咨询一下美术课程的具体安排。',
      '你们的教学时间是怎么安排的？',
      '老师的教学经验丰富吗？',
      '班级人数多吗？',
      '报名需要准备什么材料？'
    ]

    // 根据音频长度选择合适的文本
    const index = Math.floor((audioLength / 1000) % mockTexts.length)
    return mockTexts[index]
  }

  /**
   * 获取支持的音频格式
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats]
  }

  /**
   * 验证音频格式是否支持
   */
  isFormatSupported(format: string): boolean {
    return this.supportedFormats.includes(format.toLowerCase())
  }

  /**
   * 清理语音转文字缓存
   */
  async clearVoiceCache(): Promise<void> {
    try {
      const pattern = `${this.cachePrefix}*`
      await this.aiCacheService.deletePattern(pattern)
      this.logger.log('语音转文字缓存清理完成')
    } catch (error) {
      this.logger.error('清理语音转文字缓存失败:', error)
    }
  }
}