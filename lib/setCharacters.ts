const loadedFontsMap = new Map<string, true>()

export async function setCharacters(args: {
  node: SceneNode
  characters: string | number
}) {
  const { node, characters } = args

  if (node.type !== "TEXT") {
    figma.notify("Node is not a text layer")
    return
  }

  await Promise.all(
    node
      .getRangeAllFontNames(0, node.characters.length)
      .map(async (fontName) => {
        const fontNameKey = `${fontName.family}-${fontName.style}`

        if (loadedFontsMap.has(fontNameKey)) {
          return
        }

        await figma.loadFontAsync(fontName)

        loadedFontsMap.set(fontNameKey, true)
      }),
  )

  node.characters = String(characters)
}
