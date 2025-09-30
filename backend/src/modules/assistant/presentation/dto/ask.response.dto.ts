import { ApiProperty } from '@nestjs/swagger';
import { AiAskResponse } from '../../application/services/assistant.service';

type CitationDtoProps = {
  url?: string;
  title?: string;
  section?: string;
  snippet?: string;
};

export class CitationDto {
  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  section?: string;

  @ApiProperty({ required: false })
  snippet?: string;

  static from(props: CitationDtoProps): CitationDto {
    const dto = new CitationDto();
    dto.url = props.url;
    dto.title = props.title;
    dto.section = props.section;
    dto.snippet = props.snippet;
    return dto;
  }
}

export class AskResponseDto {
  @ApiProperty({
    name: 'answer_md',
    description: 'Jawaban dalam format Markdown.',
  })
  answer_md!: string;

  @ApiProperty({ type: () => [CitationDto] })
  citations!: CitationDto[];

  @ApiProperty({ name: 'retrieval_meta', required: false, type: Object })
  retrieval_meta?: Record<string, unknown>;

  @ApiProperty({ name: 'model_meta', required: false, type: Object })
  model_meta?: Record<string, unknown>;

  static fromAi(response: AiAskResponse): AskResponseDto {
    const dto = new AskResponseDto();
    dto.answer_md = response.answer_md;
    dto.citations = (response.citations ?? []).map((citation) =>
      CitationDto.from(citation),
    );
    dto.retrieval_meta = response.retrieval_meta;
    dto.model_meta = response.model_meta;
    return dto;
  }
}
