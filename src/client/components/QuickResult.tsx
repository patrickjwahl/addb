import { MutableRefObject, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"

type QuickResultRow = {
    title: string,
    subtitle?: string | null,
    category?: string | null,
    handleClick: (e: React.MouseEvent) => void
}

export default function QuickResult({ anchorRef, data, focus }: { anchorRef: MutableRefObject<HTMLInputElement | null>, data: QuickResultRow[], focus: number }) {

    const [style, setStyle] = useState({})

    useLayoutEffect(() => {
        if (!anchorRef.current) return
        const rect = anchorRef.current.getBoundingClientRect()

        setStyle({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        })
    }, [])

    return createPortal(
        <>
            <ul className='quick-result-list' style={style}>
                {
                    data.map((row, index) => {
                        let liClass
                        if (index === focus) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        return (
                            <li className={liClass} key={index} onMouseDown={e => row.handleClick(e)}>
                                {row.category && <div className='quick-result-type'>{row.category}</div>}
                                <div className='quick-result-title'>{row.title}</div>
                                {row.subtitle && <div className='quick-result-subtitle'>{row.subtitle}</div>}
                            </li>
                        )
                    })
                }
            </ul>
        </>,
        document.body
    )
}
