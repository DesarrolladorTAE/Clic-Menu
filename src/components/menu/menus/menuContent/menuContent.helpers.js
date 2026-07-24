function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function cloneSchedules(
  schedules
) {
  return Array.isArray(schedules)
    ? schedules.map((schedule) => ({
        ...schedule,

        day_of_week:
          Number(
            schedule?.day_of_week
          ),

        start_time:
          String(
            schedule?.start_time ||
              ""
          ).slice(0, 5),

        end_time:
          String(
            schedule?.end_time ||
              ""
          ).slice(0, 5),

        is_active:
          schedule?.is_active !==
          false,
      }))
    : [];
}

function mapById(items = []) {
  return new Map(
    items.map((item) => [
      Number(item.id),
      item,
    ])
  );
}

function hasPersistedAssignment(
  item
) {
  return (
    item?.assignment_id !== null &&
    item?.assignment_id !== undefined
  );
}

function getCatalogOrder(
  item
) {
  if (
    item?.catalog_sort_order !== null &&
    item?.catalog_sort_order !== undefined
  ) {
    return toNumber(
      item.catalog_sort_order
    );
  }

  if (
    item?.sort_order !== null &&
    item?.sort_order !== undefined
  ) {
    return toNumber(
      item.sort_order
    );
  }

  return 0;
}

function sortSelectedItemsByOrder(
  items = []
) {
  return [...items]
    .filter(
      (item) =>
        item.is_selected
    )
    .sort((a, b) => {
      const bySelectedOrder =
        toNumber(
          a.selected_sort_order
        ) -
        toNumber(
          b.selected_sort_order
        );

      if (bySelectedOrder !== 0) {
        return bySelectedOrder;
      }

      const byCatalogOrder =
        getCatalogOrder(a) -
        getCatalogOrder(b);

      if (byCatalogOrder !== 0) {
        return byCatalogOrder;
      }

      return String(
        a.name || ""
      ).localeCompare(
        String(b.name || ""),
        "es",
        {
          sensitivity: "base",
        }
      );
    });
}

export function mergeCatalogAndContent(
  catalogData,
  contentData
) {
  const savedSections =
    mapById(
      contentData?.sections || []
    );

  const sections = (
    catalogData?.sections || []
  ).map(
    (
      catalogSection,
      sectionIndex
    ) => {
      const savedSection =
        savedSections.get(
          Number(
            catalogSection.id
          )
        );

      const savedCategories =
        mapById(
          savedSection?.categories ||
            []
        );

      const categories = (
        catalogSection.categories ||
        []
      ).map(
        (
          catalogCategory,
          categoryIndex
        ) => {
          const savedCategory =
            savedCategories.get(
              Number(
                catalogCategory.id
              )
            );

          const savedProducts =
            mapById(
              savedCategory?.products ||
                []
            );

          const products = (
            catalogCategory.products ||
            []
          ).map(
            (
              catalogProduct,
              productIndex
            ) => {
              const savedProduct =
                savedProducts.get(
                  Number(
                    catalogProduct.id
                  )
                );

              return {
                ...catalogProduct,

                /*
                |--------------------------------------------------------------------------
                | Posición estable del catálogo
                |--------------------------------------------------------------------------
                |
                | Esta posición no cambia cuando el usuario selecciona el producto.
                | Después de guardar, assignment_id permitirá mostrarlo dentro del
                | orden definitivo del menú.
                */
                catalog_sort_order:
                  catalogProduct
                    .catalog_sort_order ??
                  productIndex,

                is_selected:
                  !!savedProduct ||
                  !!catalogProduct.is_selected,

                selected_sort_order:
                  savedProduct
                    ? toNumber(
                        savedProduct.sort_order
                      )
                    : catalogProduct
                          .selected_sort_order ??
                      productIndex,

                assignment_id:
                  savedProduct
                    ?.assignment_id ??
                  catalogProduct
                    .assignment_id ??
                  null,

                schedules:
                  cloneSchedules(
                    savedProduct
                      ?.schedules || []
                  ),

                effective_schedule:
                  savedProduct
                    ?.effective_schedule ||
                  [],
              };
            }
          );

          return {
            ...catalogCategory,

            /*
            |--------------------------------------------------------------------------
            | Posición estable del catálogo
            |--------------------------------------------------------------------------
            */
            catalog_sort_order:
              catalogCategory
                .catalog_sort_order ??
              categoryIndex,

            is_selected:
              !!savedCategory ||
              !!catalogCategory.is_selected,

            selected_sort_order:
              savedCategory
                ? toNumber(
                    savedCategory.sort_order
                  )
                : catalogCategory
                      .selected_sort_order ??
                  categoryIndex,

            assignment_id:
              savedCategory
                ?.assignment_id ??
              catalogCategory
                .assignment_id ??
              null,

            schedules:
              cloneSchedules(
                savedCategory
                  ?.schedules || []
              ),

            effective_schedule:
              savedCategory
                ?.effective_schedule ||
              [],

            products,
          };
        }
      );

      return {
        ...catalogSection,

        /*
        |--------------------------------------------------------------------------
        | Posición estable del catálogo
        |--------------------------------------------------------------------------
        */
        catalog_sort_order:
          catalogSection
            .catalog_sort_order ??
          sectionIndex,

        is_selected:
          !!savedSection ||
          !!catalogSection.is_selected,

        selected_sort_order:
          savedSection
            ? toNumber(
                savedSection.sort_order
              )
            : catalogSection
                  .selected_sort_order ??
              sectionIndex,

        assignment_id:
          savedSection
            ?.assignment_id ??
          catalogSection
            .assignment_id ??
          null,

        schedules:
          cloneSchedules(
            savedSection
              ?.schedules || []
          ),

        effective_schedule:
          savedSection
            ?.effective_schedule ||
          [],

        categories,
      };
    }
  );

  return {
    menu:
      contentData?.menu ||
      catalogData?.menu ||
      null,

    products_mode:
      catalogData?.products_mode ||
      "global",

    sections,
  };
}

function nextSelectedOrder(
  items
) {
  const selectedOrders = items
    .filter(
      (item) => item.is_selected
    )
    .map((item) =>
      toNumber(
        item.selected_sort_order
      )
    );

  if (
    selectedOrders.length === 0
  ) {
    return 0;
  }

  return (
    Math.max(
      ...selectedOrders
    ) + 1
  );
}

function deselectProduct(
  product
) {
  return {
    ...product,

    is_selected: false,
    selected_sort_order: null,
    assignment_id: null,
    schedules: [],
    effective_schedule: [],
  };
}

function deselectCategory(
  category
) {
  return {
    ...category,

    is_selected: false,
    selected_sort_order: null,
    assignment_id: null,
    schedules: [],
    effective_schedule: [],

    products: (
      category.products || []
    ).map(deselectProduct),
  };
}

function deselectSection(
  section
) {
  return {
    ...section,

    is_selected: false,
    selected_sort_order: null,
    assignment_id: null,
    schedules: [],
    effective_schedule: [],

    categories: (
      section.categories || []
    ).map(deselectCategory),
  };
}

export function setHierarchySelection(
  sections,
  target,
  checked
) {
  const sectionId =
    Number(target.sectionId);

  return sections.map(
    (section) => {
      if (
        Number(section.id) !==
        sectionId
      ) {
        return section;
      }

      if (
        target.type ===
        "section"
      ) {
        if (!checked) {
          return deselectSection(
            section
          );
        }

        return {
          ...section,

          is_selected: true,

          selected_sort_order:
            section
              .selected_sort_order ??
            nextSelectedOrder(
              sections
            ),
        };
      }

      const sectionSelectedOrder =
        section.is_selected
          ? section
              .selected_sort_order
          : nextSelectedOrder(
              sections
            );

      const categories = (
        section.categories || []
      ).map((category) => {
        if (
          Number(category.id) !==
          Number(
            target.categoryId
          )
        ) {
          return category;
        }

        if (
          target.type ===
          "category"
        ) {
          if (!checked) {
            return deselectCategory(
              category
            );
          }

          return {
            ...category,

            is_selected: true,

            selected_sort_order:
              category
                .selected_sort_order ??
              nextSelectedOrder(
                section.categories ||
                  []
              ),
          };
        }

        const categorySelectedOrder =
          category.is_selected
            ? category
                .selected_sort_order
            : nextSelectedOrder(
                section.categories ||
                  []
              );

        const products = (
          category.products || []
        ).map((product) => {
          if (
            Number(product.id) !==
            Number(
              target.productId
            )
          ) {
            return product;
          }

          if (!checked) {
            return deselectProduct(
              product
            );
          }

          return {
            ...product,

            is_selected: true,

            selected_sort_order:
              product
                .selected_sort_order ??
              nextSelectedOrder(
                category.products ||
                  []
              ),
          };
        });

        return {
          ...category,

          is_selected:
            checked
              ? true
              : category.is_selected,

          selected_sort_order:
            checked
              ? categorySelectedOrder
              : category
                  .selected_sort_order,

          products,
        };
      });

      return {
        ...section,

        is_selected:
          checked
            ? true
            : section.is_selected,

        selected_sort_order:
          checked
            ? sectionSelectedOrder
            : section
                .selected_sort_order,

        categories,
      };
    }
  );
}

function reorderSelectedItems(
  items,
  itemId,
  direction
) {
  const selected =
    sortSelectedItemsByOrder(
      items
    );

  const currentIndex =
    selected.findIndex(
      (item) =>
        Number(item.id) ===
        Number(itemId)
    );

  if (currentIndex < 0) {
    return items;
  }

  const targetIndex =
    direction === "up"
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    targetIndex < 0 ||
    targetIndex >=
      selected.length
  ) {
    return items;
  }

  const nextSelected = [
    ...selected,
  ];

  [
    nextSelected[currentIndex],
    nextSelected[targetIndex],
  ] = [
    nextSelected[targetIndex],
    nextSelected[currentIndex],
  ];

  const orderMap =
    new Map(
      nextSelected.map(
        (item, index) => [
          Number(item.id),
          index,
        ]
      )
    );

  return items.map((item) => {
    if (
      !orderMap.has(
        Number(item.id)
      )
    ) {
      return item;
    }

    return {
      ...item,

      selected_sort_order:
        orderMap.get(
          Number(item.id)
        ),
    };
  });
}

export function moveHierarchyItem(
  sections,
  target,
  direction
) {
  if (
    target.type ===
    "section"
  ) {
    return reorderSelectedItems(
      sections,
      target.sectionId,
      direction
    );
  }

  return sections.map(
    (section) => {
      if (
        Number(section.id) !==
        Number(
          target.sectionId
        )
      ) {
        return section;
      }

      if (
        target.type ===
        "category"
      ) {
        return {
          ...section,

          categories:
            reorderSelectedItems(
              section.categories ||
                [],
              target.categoryId,
              direction
            ),
        };
      }

      return {
        ...section,

        categories: (
          section.categories ||
          []
        ).map((category) => {
          if (
            Number(category.id) !==
            Number(
              target.categoryId
            )
          ) {
            return category;
          }

          return {
            ...category,

            products:
              reorderSelectedItems(
                category.products ||
                  [],
                target.productId,
                direction
              ),
          };
        }),
      };
    }
  );
}

export function updateHierarchySchedules(
  sections,
  target,
  schedules
) {
  const normalizedSchedules =
    cloneSchedules(schedules);

  return sections.map(
    (section) => {
      if (
        Number(section.id) !==
        Number(
          target.sectionId
        )
      ) {
        return section;
      }

      if (
        target.type ===
        "section"
      ) {
        return {
          ...section,

          schedules:
            normalizedSchedules,
        };
      }

      return {
        ...section,

        categories: (
          section.categories || []
        ).map((category) => {
          if (
            Number(category.id) !==
            Number(
              target.categoryId
            )
          ) {
            return category;
          }

          if (
            target.type ===
            "category"
          ) {
            return {
              ...category,

              schedules:
                normalizedSchedules,
            };
          }

          return {
            ...category,

            products: (
              category.products || []
            ).map((product) => {
              if (
                Number(product.id) !==
                Number(
                  target.productId
                )
              ) {
                return product;
              }

              return {
                ...product,

                schedules:
                  normalizedSchedules,
              };
            }),
          };
        }),
      };
    }
  );
}

export function findHierarchyNode(
  sections,
  target
) {
  const section =
    sections.find(
      (item) =>
        Number(item.id) ===
        Number(
          target.sectionId
        )
    );

  if (!section) return null;

  if (
    target.type ===
    "section"
  ) {
    return section;
  }

  const category =
    (
      section.categories || []
    ).find(
      (item) =>
        Number(item.id) ===
        Number(
          target.categoryId
        )
    );

  if (!category) return null;

  if (
    target.type ===
    "category"
  ) {
    return category;
  }

  return (
    category.products || []
  ).find(
    (item) =>
      Number(item.id) ===
      Number(
        target.productId
      )
  ) || null;
}

/*
|--------------------------------------------------------------------------
| Orden visual
|--------------------------------------------------------------------------
|
| Los elementos que ya fueron guardados conservan el orden configurado
| en el menú.
|
| Los elementos seleccionados por primera vez, que todavía no tienen
| assignment_id, conservan su posición original en el catálogo y no
| saltan automáticamente al inicio.
|
| Después de guardar, el backend devuelve assignment_id y el elemento
| pasa a mostrarse en su orden definitivo.
*/
export function sortHierarchyItems(
  items = []
) {
  return [...items].sort(
    (a, b) => {
      const aPersistedSelected =
        !!a.is_selected &&
        hasPersistedAssignment(a);

      const bPersistedSelected =
        !!b.is_selected &&
        hasPersistedAssignment(b);

      if (
        aPersistedSelected &&
        bPersistedSelected
      ) {
        const bySelectedOrder =
          toNumber(
            a.selected_sort_order
          ) -
          toNumber(
            b.selected_sort_order
          );

        if (bySelectedOrder !== 0) {
          return bySelectedOrder;
        }
      }

      if (
        aPersistedSelected !==
        bPersistedSelected
      ) {
        return aPersistedSelected
          ? -1
          : 1;
      }

      const byCatalogOrder =
        getCatalogOrder(a) -
        getCatalogOrder(b);

      if (
        byCatalogOrder !== 0
      ) {
        return byCatalogOrder;
      }

      return String(
        a.name || ""
      ).localeCompare(
        String(b.name || ""),
        "es",
        {
          sensitivity:
            "base",
        }
      );
    }
  );
}

export function getMoveAvailability(
  items,
  itemId
) {
  const selected =
    sortSelectedItemsByOrder(
      items
    );

  const index =
    selected.findIndex(
      (item) =>
        Number(item.id) ===
        Number(itemId)
    );

  return {
    canMoveUp:
      index > 0,

    canMoveDown:
      index >= 0 &&
      index <
        selected.length - 1,
  };
}

function cleanSchedule(
  schedule
) {
  return {
    day_of_week:
      Number(
        schedule.day_of_week
      ),

    start_time:
      String(
        schedule.start_time
      ).slice(0, 5),

    end_time:
      String(
        schedule.end_time
      ).slice(0, 5),

    is_active:
      schedule.is_active !==
      false,
  };
}

export function buildMenuContentPayload(
  sections
) {
  /*
  |--------------------------------------------------------------------------
  | Orden enviado al backend
  |--------------------------------------------------------------------------
  |
  | Aunque un elemento nuevo conserve temporalmente su posición visual,
  | el payload utiliza selected_sort_order para guardar la jerarquía en
  | el orden configurado.
  */
  const selectedSections =
    sortSelectedItemsByOrder(
      sections
    );

  return {
    sections:
      selectedSections.map(
        (
          section,
          sectionIndex
        ) => {
          const selectedCategories =
            sortSelectedItemsByOrder(
              section.categories ||
                []
            );

          return {
            menu_section_id:
              Number(
                section.id
              ),

            sort_order:
              sectionIndex,

            schedules: (
              section.schedules ||
              []
            ).map(cleanSchedule),

            categories:
              selectedCategories.map(
                (
                  category,
                  categoryIndex
                ) => {
                  const selectedProducts =
                    sortSelectedItemsByOrder(
                      category.products ||
                        []
                    );

                  return {
                    category_id:
                      Number(
                        category.id
                      ),

                    sort_order:
                      categoryIndex,

                    schedules: (
                      category.schedules ||
                      []
                    ).map(
                      cleanSchedule
                    ),

                    products:
                      selectedProducts.map(
                        (
                          product,
                          productIndex
                        ) => ({
                          product_id:
                            Number(
                              product.id
                            ),

                          sort_order:
                            productIndex,

                          schedules: (
                            product.schedules ||
                            []
                          ).map(
                            cleanSchedule
                          ),
                        })
                      ),
                  };
                }
              ),
          };
        }
      ),
  };
}

export function getHierarchySummary(
  sections
) {
  let selectedSections = 0;
  let selectedCategories = 0;
  let selectedProducts = 0;
  let schedulesCount = 0;

  sections.forEach(
    (section) => {
      if (
        section.is_selected
      ) {
        selectedSections++;

        schedulesCount +=
          (
            section.schedules ||
            []
          ).length;
      }

      (
        section.categories || []
      ).forEach(
        (category) => {
          if (
            category.is_selected
          ) {
            selectedCategories++;

            schedulesCount +=
              (
                category.schedules ||
                []
              ).length;
          }

          (
            category.products ||
            []
          ).forEach(
            (product) => {
              if (
                product.is_selected
              ) {
                selectedProducts++;

                schedulesCount +=
                  (
                    product.schedules ||
                    []
                  ).length;
              }
            }
          );
        }
      );
    }
  );

  return {
    sections:
      selectedSections,

    categories:
      selectedCategories,

    products:
      selectedProducts,

    schedules:
      schedulesCount,
  };
}

function matchesSearch(
  item,
  search
) {
  const content = [
    item?.name,
    item?.description,
    item?.display_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase(
      "es-MX"
    );

  return content.includes(
    search
  );
}

export function filterHierarchy(
  sections,
  search,
  selectedOnly
) {
  const normalizedSearch =
    String(search || "")
      .trim()
      .toLocaleLowerCase(
        "es-MX"
      );

  return sections
    .map((section) => {
      if (
        selectedOnly &&
        !section.is_selected
      ) {
        return null;
      }

      const sectionMatches =
        normalizedSearch === "" ||
        matchesSearch(
          section,
          normalizedSearch
        );

      const categories = (
        section.categories || []
      )
        .map((category) => {
          if (
            selectedOnly &&
            !category.is_selected
          ) {
            return null;
          }

          const categoryMatches =
            normalizedSearch === "" ||
            matchesSearch(
              category,
              normalizedSearch
            );

          const products = (
            category.products || []
          ).filter((product) => {
            if (
              selectedOnly &&
              !product.is_selected
            ) {
              return false;
            }

            if (
              normalizedSearch === ""
            ) {
              return true;
            }

            return matchesSearch(
              product,
              normalizedSearch
            );
          });

          if (
            normalizedSearch !== "" &&
            !sectionMatches &&
            !categoryMatches &&
            products.length === 0
          ) {
            return null;
          }

          return {
            ...category,

            products:
              sectionMatches ||
              categoryMatches
                ? (
                    category.products ||
                    []
                  ).filter(
                    (product) =>
                      !selectedOnly ||
                      product
                        .is_selected
                  )
                : products,
          };
        })
        .filter(Boolean);

      if (
        normalizedSearch !== "" &&
        !sectionMatches &&
        categories.length === 0
      ) {
        return null;
      }

      return {
        ...section,

        categories:
          sectionMatches
            ? (
                section.categories ||
                []
              )
                .filter(
                  (category) =>
                    !selectedOnly ||
                    category
                      .is_selected
                )
                .map(
                  (category) => ({
                    ...category,

                    products: (
                      category.products ||
                      []
                    ).filter(
                      (product) =>
                        !selectedOnly ||
                        product
                          .is_selected
                    ),
                  })
                )
            : categories,
      };
    })
    .filter(Boolean);
}

export function getScheduleCount(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return value.length;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(
      value
    ).reduce(
      (
        total,
        current
      ) =>
        total +
        getScheduleCount(
          current
        ),
      0
    );
  }

  return 0;
}

export function getBackendMessage(
  error,
  fallback
) {
  const data =
    error?.response?.data;

  const messages =
    Object.values(
      data?.errors || {}
    )
      .flat(Infinity)
      .filter(Boolean);

  return (
    data?.message ||
    messages[0] ||
    error?.message ||
    fallback
  );
}