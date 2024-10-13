"use client"

import styles from "./page.module.css"
import React, { useState } from "react"
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
  const [lists, setLists] = useState<ListsTypes[]>([])
  const [AddingNewList, setAddingNewList] = useState<boolean>(false)
  const [tempTileList, setTempTitleList] = useState<string>("")

  function handleAddingNewList() {
    setAddingNewList(!AddingNewList)
  }

  function handleAddNewList() {
    const id = uuidv4()
    setLists((prevLists) => [
      ...prevLists,
      {
        id: id,
        title: tempTileList,
        lists: [],
      },
    ])
    handleAddingNewList()
    setTempTitleList("")
  }

  function deleteList(list_id: string) {
    setLists((prevLists) => prevLists.filter((list) => list.id !== list_id))
  }

  function onDragEnd(result: any) {
    const { source, destination } = result

    if (!destination) return // Dropped outside the list

    // Rearranging lists
    if (source.droppableId === "lists" && destination.droppableId === "lists") {
      const reorderedLists = Array.from(lists)
      const [removed] = reorderedLists.splice(source.index, 1)
      reorderedLists.splice(destination.index, 0, removed)
      setLists(reorderedLists)
      return
    }

    // Moving cards between lists
    if (source.droppableId !== destination.droppableId) {
      const sourceListIndex = lists.findIndex((list) => list.id === source.droppableId)
      const destListIndex = lists.findIndex((list) => list.id === destination.droppableId)
      const sourceList = lists[sourceListIndex]
      const destList = lists[destListIndex]

      const [movedCard] = sourceList.lists.splice(source.index, 1)
      destList.lists.splice(destination.index, 0, movedCard)

      setLists((prevLists) => {
        const updatedLists = [...prevLists]
        updatedLists[sourceListIndex] = sourceList
        updatedLists[destListIndex] = destList
        return updatedLists
      })
    }
  }

  const RenderList = ({ list }: { list: ListsTypes }) => {
    const [newCard, setNewCard] = useState<boolean>(false)
    const [newCardTitle, setNewCardTitle] = useState<string>("")

    function handleAddNewCard() {
      setNewCard(!newCard)
    }

    function addNewCard(listId: string) {
      const id = uuidv4()

      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
              ...list,
              lists: [...list.lists, { id: id, title: newCardTitle }],
            }
            : list
        )
      )

      setNewCard(false)
      setNewCardTitle("")
    }

    function deleteCard(card_id: string, list_id: string) {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === list_id
            ? {
              ...list,
              lists: list.lists.filter((card) => card.id !== card_id),
            }
            : list
        )
      )
    }

    return (
      <div className={styles.container_list}>
        <div className={styles.title_box}>
          <p> {list.title} </p>
          <button
            className={styles.delete_list_btn}
            onClick={() => deleteList(list.id)}>
            <CiTrash />
          </button>
        </div>
        <Droppable droppableId={list.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {list.lists.map((list_item, index) => (
                <Draggable key={list_item.id} draggableId={list_item.id} index={index}>
                  {(provided) => (
                    <div
                      className={styles.card}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <p>{list_item.title}</p>
                      <button
                        className={styles.delete_card_btn}
                        onClick={() => deleteCard(list_item.id, list.id)}>
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
              +  Adicionar novo card
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
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.page}>
        <div className={styles.container}>
          {lists &&
            lists.map((list) => (
              <RenderList key={list.id} list={list} />
            ))}
          {!AddingNewList ? (
            <button onClick={handleAddingNewList} className={styles.new_list_btn}>
              + Adicionar nova lista
            </button>
          ) : (
            <form className={styles.add_new_list_container}>
              <input
                autoFocus
                placeholder="Nome da sua Lista"
                value={tempTileList}
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
      </div>
    </DragDropContext>
  )
}
