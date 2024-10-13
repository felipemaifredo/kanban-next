"use client"

import styles from "./page.module.css"
import React, { useState, useEffect, useCallback } from "react"
import { IoMdClose } from "react-icons/io"
import { CiTrash } from "react-icons/ci"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { v4 as uuidv4 } from "uuid"

type ListTypes = {
  id: string
  title: string
}

type ListsTypes = {
  id: string
  title: string
  lists: ListTypes[]
}

export default function Home() {
  const [lists, setLists] = useState<ListsTypes[]>(() => {
    const savedLists = localStorage.getItem("lists")
    return savedLists ? JSON.parse(savedLists) : []
  })

  const [addingNewList, setAddingNewList] = useState<boolean>(false)
  const [tempTitleList, setTempTitleList] = useState<string>("")

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists))
  }, [lists])

  const handleAddingNewList = useCallback(() => {
    setAddingNewList(!addingNewList)
  }, [addingNewList])

  const handleAddNewList = useCallback(() => {
    const id = uuidv4()
    setLists((prevLists) => [
      ...prevLists,
      {
        id: id,
        title: tempTitleList,
        lists: [],
      },
    ])
    handleAddingNewList()
    setTempTitleList("")
  }, [tempTitleList, handleAddingNewList])

  const deleteList = useCallback((listId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta lista?")) {
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId))
    }
  }, [])

  const onDragEnd = useCallback((result: any) => {
    const { source, destination } = result

    if (!destination) return // Soltou fora da lista ou card

    // Reordenar listas
    if (source.droppableId === "lists" && destination.droppableId === "lists") {
      reorderLists(source.index, destination.index)
      return
    }

    // Mover cards entre listas
    if (source.droppableId !== destination.droppableId) {
      moveCardBetweenLists(source, destination)
    }
  }, [lists])

  const reorderLists = useCallback((sourceIndex: number, destinationIndex: number) => {
    const reorderedLists = Array.from(lists)
    const [removed] = reorderedLists.splice(sourceIndex, 1)
    reorderedLists.splice(destinationIndex, 0, removed)
    setLists(reorderedLists)
  }, [lists])

  const moveCardBetweenLists = useCallback((source: { droppableId: string; index: number }, destination: { droppableId: string; index: number }) => {
    const sourceListIndex = lists.findIndex((list) => list.id === source.droppableId)
    const destListIndex = lists.findIndex((list) => list.id === destination.droppableId)
    const sourceList = lists[sourceListIndex]
    const destList = lists[destListIndex]

    const [movedCard] = sourceList.lists.splice(source.index, 1)
    destList.lists.splice(destination.index, 0, movedCard)

    setLists([...lists])
  }, [lists])

  const RenderList = React.memo(({ list, index }: { list: ListsTypes, index: number }) => {
    const [newCard, setNewCard] = useState<boolean>(false)
    const [newCardTitle, setNewCardTitle] = useState<string>("")

    const handleAddNewCard = useCallback(() => {
      setNewCard(!newCard)
    }, [newCard])

    const addNewCard = useCallback((listId: string) => {
      const id = uuidv4()
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? { ...list, lists: [...list.lists, { id, title: newCardTitle }] }
            : list
        )
      )
      setNewCard(false)
      setNewCardTitle("")
    }, [newCardTitle])

    const deleteCard = useCallback((cardId: string, listId: string) => {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? { ...list, lists: list.lists.filter((card) => card.id !== cardId) }
            : list
        )
      )
    }, [])

    return (
      <Draggable draggableId={list.id} index={index}>
        {(provided) => (
          <div
            className={styles.container_list}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={styles.title_box}>
              <p>{list.title}</p>
              <button className={styles.delete_list_btn} onClick={() => deleteList(list.id)}>
                <CiTrash />
              </button>
            </div>
            <Droppable droppableId={list.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {list.lists.map((list_item, index) => (
                    <Draggable key={list_item.id} draggableId={list_item.id} index={index}>
                      {(provided) => (
                        <div
                          className={styles.card}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div>
                            <p>{list_item.title}</p>
                          </div>
                          <button
                            className={styles.delete_card_btn}
                            onClick={() => deleteCard(list_item.id, list.id)}
                          >
                            <CiTrash />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div>
              {!newCard ? (
                <button onClick={handleAddNewCard} className={styles.new_card_btn}>
                  + Adicionar novo card
                </button>
              ) : (
                <form className={styles.add_new_card_container}>
                  <input
                    autoFocus
                    placeholder="Nome do seu card"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                  />
                  <div>
                    <button onClick={() => addNewCard(list.id)}>Adicionar card</button>
                    <button onClick={handleAddNewCard}>
                      <IoMdClose />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Draggable>
    )
  })

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.page}>
        <Droppable droppableId="lists" direction="horizontal" type="LISTS">
          {(provided) => (
            <div
              className={styles.container}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lists &&
                lists.map((list, index) => (
                  <RenderList key={list.id} list={list} index={index} />
                ))}
              {provided.placeholder}
              {!addingNewList ? (
                <button onClick={handleAddingNewList} className={styles.new_list_btn}>
                  + Adicionar nova lista
                </button>
              ) : (
                <form className={styles.add_new_list_container}>
                  <input
                    autoFocus
                    placeholder="Nome da sua Lista"
                    value={tempTitleList}
                    onChange={(e) => setTempTitleList(e.target.value)}
                  />
                  <div>
                    <button onClick={handleAddNewList}>Adicionar lista</button>
                    <button onClick={handleAddingNewList}>
                      <IoMdClose />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}

