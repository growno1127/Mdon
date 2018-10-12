export function autoUnfoldCW (settings, status) {
  if (!settings.getIn(['content_warnings', 'auto_unfold'])) {
    return false;
  }

  const rawRegex = settings.getIn(['content_warnings', 'filter']);

  if (!rawRegex) {
    return true;
  }

  let regex      = null;

  try {
    regex = rawRegex && new RegExp(rawRegex.trim(), 'i');
  } catch (e) {
    // Bad regex, don't affect filters
  }

  if (!(status && regex)) {
    return undefined;
  }
  return !regex.test(status.get('spoiler_text'));
}
