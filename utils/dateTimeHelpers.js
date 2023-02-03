import formatDistance from "date-fns/formatDistance"
import intervalToDuration from "date-fns/intervalToDuration"
import isWithinInterval from "date-fns/isWithinInterval"
import add from "date-fns/add"

const getTimeAgo = (date, addSuffix = true) => {
	if (!date) {
		return "N/A"
	}
	const now = new Date()

	const actualDate = date?.toString().includes("Now") ? now : date

	let formattedDate = formatDistance(new Date(actualDate), now, {
		addSuffix,
		includeSeconds: true,
	})

	return formattedDate.replace("less than", "").replace("about ", "").replace("minute", "min").replace("second", "sec")
}

export {getTimeAgo, intervalToDuration, isWithinInterval, add}
