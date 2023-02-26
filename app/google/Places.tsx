import {AutoComplete} from "antd"
import {useState} from "react"
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete"

import type {FC} from "react"

interface Geolocation {
	lat: number
	lng: number
}

const Places: FC = () => {
	const {
		ready,
		value, // value of the address
		setValue,
		suggestions: {status, data}, // returned list of addresses
		clearSuggestions,
	} = usePlacesAutocomplete()

	const [selected, setSelected] = useState<Geolocation | null>(null)

	const handleSelect = async (address: string) => {
		setValue(address, false)
		clearSuggestions()

		const results = await getGeocode({address})
		const result = results[0]
		if (result) {
			const {lat, lng} = getLatLng(result)
			setSelected({lat, lng})
		}
	}

	return (
		<div>
			<AutoComplete
				className="w-full"
				value={value}
				onChange={(data) => setValue(data)}
				disabled={!ready}
				onSelect={(data) => {
					handleSelect(data).catch(console.error)
				}}
			>
				{status === `OK` &&
					data.map(({place_id, description}) => (
						<AutoComplete.Option key={place_id} value={description}>
							{description}
						</AutoComplete.Option>
					))}
			</AutoComplete>
			<div>Address: {value}</div>
			<div>
				{selected && (
					<span>
						Latitude: {selected.lat}, Longitude: {selected.lng}
					</span>
				)}
			</div>
		</div>
	)
}

export default Places
