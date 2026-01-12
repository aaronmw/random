#!/bin/bash

OUTPUT_FILE=$(mktemp)
trap "rm -f $OUTPUT_FILE" EXIT

playwright test --reporter=line 2>&1 | tee "$OUTPUT_FILE"
EXIT_CODE=${PIPESTATUS[0]}

if [ -s "$OUTPUT_FILE" ]; then
  sed -E 's/\x1b\[[0-9;]*[a-zA-Z]//g' "$OUTPUT_FILE" | pbcopy
  echo ""
  echo "✓ Test output copied to clipboard (ANSI codes removed)"
fi

exit $EXIT_CODE
