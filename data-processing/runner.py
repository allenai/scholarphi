from entities.abbreviations.extractor import AbbreviationExtractor

a = AbbreviationExtractor()
print(*list(a.parse("", "Natural Langauge Processing (NLP) is a sub-field of artificial intelligence (AI).")), sep = '\n')
