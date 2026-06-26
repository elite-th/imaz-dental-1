"use client";

import { useState, useMemo, useCallback } from "react";
import {
  bookingsApi,
  slotsApi,
  ApiError,
  Booking,
  BookingStats,
  TimeSlot,
} from "@/lib/api";
import { useI18n } from "@/i18n/context";
import { toast } from "sonner";
import { ITEMS_PER_PAGE } from "../constants";
import type {
  BookingStatus,
  NewBookingFormData,
  EditBookingData,
} from "../types";

export function useBookings() {
  const { t } = useI18n();

  /* ---- Data state ---- */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apiStats, setApiStats] = useState<BookingStats | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ---- UI state ---- */
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingsPage, setBookingsPage] = useState(1);

  /* ---- Selected booking + panels ---- */
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  /* ---- Create booking modal state ---- */
  const [newBookingData, setNewBookingData] = useState<NewBookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [creatingBooking, setCreatingBooking] = useState(false);

  /* ---- Edit booking state ---- */
  const [editingBooking, setEditingBooking] = useState(false);
  const [editBookingData, setEditBookingData] = useState<EditBookingData>({ date: "", time: "", notes: "" });

  /* ---- Available slots (for create-booking flow) ---- */
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* ---- Fetch bookings ---- */
  const fetchBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setBookingsLoading(true);
    setBookingsError(null);
    try {
      const result = await bookingsApi.list();
      setBookings(result.bookings);
      setApiStats(result.stats);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.load_error");
      setBookingsError(message);
    } finally {
      if (showLoading) setBookingsLoading(false);
    }
  }, [t]);

  /* ---- Fetch available slots for booking ---- */
  const fetchAvailableSlots = async (date: string) => {
    if (!date) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    try {
      const result = await slotsApi.get(date);
      setAvailableSlots(result.slots.filter((s) => s.status === "available"));
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  /* ---- Status update ---- */
  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    setActionLoading(id);
    try {
      await bookingsApi.updateStatus(id, newStatus);
      toast.success(t("admin.status_updated"));
      await fetchBookings(false);
      setSelectedBooking((prev) => {
        if (prev && prev.id === id) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Delete booking ---- */
  const deleteBooking = async (id: string) => {
    if (!window.confirm(t("admin.confirm_delete"))) return;
    setActionLoading(id);
    try {
      await bookingsApi.delete(id);
      toast.success(t("admin.booking_deleted"));
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
        setShowDetailPanel(false);
      }
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Create booking ---- */
  const handleCreateBooking = async () => {
    if (!newBookingData.fullName || !newBookingData.phone || !newBookingData.service || !newBookingData.date || !newBookingData.time) {
      toast.error(t("admin.action_error"));
      return;
    }
    setCreatingBooking(true);
    try {
      await bookingsApi.create({
        fullName: newBookingData.fullName,
        phone: newBookingData.phone,
        email: newBookingData.email || undefined,
        service: newBookingData.service,
        date: newBookingData.date,
        time: newBookingData.time,
        notes: newBookingData.notes || undefined,
      });
      toast.success(t("admin.status_updated"));
      setShowCreateBooking(false);
      setNewBookingData({ fullName: "", phone: "", email: "", service: "", date: "", time: "", notes: "" });
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setCreatingBooking(false);
    }
  };

  /* ---- Save booking edits ---- */
  const handleSaveEdit = async () => {
    if (!selectedBooking) return;
    setActionLoading(selectedBooking.id);
    try {
      await bookingsApi.update(selectedBooking.id, {
        date: editBookingData.date,
        time: editBookingData.time,
        notes: editBookingData.notes || undefined,
      });
      toast.success(t("admin.status_updated"));
      setEditingBooking(false);
      setSelectedBooking({ ...selectedBooking, date: editBookingData.date, time: editBookingData.time, notes: editBookingData.notes || null });
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Stats from API ---- */
  const stats = useMemo<BookingStats>(() => {
    if (apiStats) return apiStats;
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      rescheduled: bookings.filter((b) => b.status === "rescheduled").length,
    };
  }, [apiStats, bookings]);

  /* ---- Filtered bookings ---- */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      const matchSearch =
        !searchQuery ||
        b.full_name.includes(searchQuery) ||
        b.phone.includes(searchQuery) ||
        t(b.service).includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [bookings, filterStatus, searchQuery, t]);

  /* ---- Paginated list ---- */
  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, bookingsPage]);

  const totalPagesBookings = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  /* ---- Reset (called by orchestrator on logout) ---- */
  const reset = () => {
    setBookings([]);
    setApiStats(null);
    setSelectedBooking(null);
    setShowDetailPanel(false);
    setShowCreateBooking(false);
    setEditingBooking(false);
    setFilterStatus("all");
    setSearchQuery("");
    setBookingsPage(1);
  };

  return {
    // data
    bookings,
    apiStats,
    bookingsLoading,
    bookingsError,
    actionLoading,
    stats,
    filteredBookings,
    paginatedBookings,
    totalPagesBookings,
    // filters / pagination
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    bookingsPage,
    setBookingsPage,
    // selection / panels
    selectedBooking,
    setSelectedBooking,
    showDetailPanel,
    setShowDetailPanel,
    showCreateBooking,
    setShowCreateBooking,
    // create booking form
    newBookingData,
    setNewBookingData,
    creatingBooking,
    // edit booking form
    editingBooking,
    setEditingBooking,
    editBookingData,
    setEditBookingData,
    // available slots
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    // actions
    fetchBookings,
    updateStatus,
    deleteBooking,
    handleCreateBooking,
    handleSaveEdit,
    reset,
  };
}

export type UseBookingsReturn = ReturnType<typeof useBookings>;
